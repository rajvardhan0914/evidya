/**
 * AI Service Layer - LLM Wrapper Abstraction
 * 
 * Provides a clean interface for LLM calls.
 * Abstracts away the specific LLM provider.
 */

export interface AIServiceConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  apiKey?: string
}

export interface AIResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  error?: string
}

/**
 * Base AI Service Interface
 */
export abstract class BaseAIService {
  protected config: AIServiceConfig

  constructor(config: AIServiceConfig = {}) {
    this.config = {
      model: config.model || 'gpt-4',
      temperature: config.temperature ?? 0.7,
      maxTokens: config.maxTokens || 1000,
      apiKey: config.apiKey || process.env.OPENAI_API_KEY,
    }
  }

  /**
   * Single turn completion
   */
  abstract call(prompt: string, systemPrompt?: string, imageBase64?: string | null): Promise<AIResponse>

  /**
   * Multi-turn chat
   */
  abstract chat(messages: { role: string, content: string | any[] }[]): Promise<AIResponse>
}

/**
 * Ollama (Local) Service Implementation
 */
export class OllamaService extends BaseAIService {
  async call(prompt: string, systemPrompt?: string, imageBase64?: string | null): Promise<AIResponse> {
    const messages: any[] = []
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    return this.chat(messages)
  }

  async chat(messages: { role: string, content: string | any[] }[]): Promise<AIResponse> {
    const baseUrl = 'http://127.0.0.1:11434'
    const model = this.config.model === 'gpt-4' ? 'llama3.2:latest' : this.config.model

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000)

    try {
      const response = await fetch(`${baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          stream: false,
          options: {
            temperature: this.config.temperature || 0.7,
          },
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      if (!response.ok) {
        throw new Error(`Ollama API Error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        content: data.message?.content || '',
      }
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        return { content: '', error: 'AI Timeout' }
      }
      return { content: '', error: 'AI connection failed' }
    }
  }
}

/**
 * OpenAI Service Implementation
 */
export class OpenAIService extends BaseAIService {
  async call(prompt: string, systemPrompt?: string, imageBase64?: string | null): Promise<AIResponse> {
    const messages: any[] = []
    if (systemPrompt) messages.push({ role: 'system', content: systemPrompt })

    if (imageBase64) {
      messages.push({
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
        ]
      })
    } else {
      messages.push({ role: 'user', content: prompt })
    }

    return this.chat(messages)
  }

  async chat(messages: { role: string, content: string | any[] }[]): Promise<AIResponse> {
    if (!this.config.apiKey) {
      throw new Error('OpenAI API key not configured')
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
        body: JSON.stringify({
          model: this.config.model,
          messages,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }))
        return {
          content: '',
          error: error.error?.message || 'AI service error',
        }
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content || ''

      return {
        content,
        usage: data.usage ? {
          promptTokens: data.usage.prompt_tokens || 0,
          completionTokens: data.usage.completion_tokens || 0,
          totalTokens: data.usage.total_tokens || 0,
        } : undefined,
      }
    } catch (error: any) {
      return {
        content: '',
        error: error.message || 'Failed to call AI service',
      }
    }
  }
}

/**
 * Mock AI Service for Development (when API key not available)
 */
export class MockAIService extends BaseAIService {
  async call(prompt: string, systemPrompt?: string, imageBase64?: string | null): Promise<AIResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))

    if (imageBase64) {
      return {
        content: 'I have reviewed your attached image/file. Based on the visual evidence and your text: \n• The diagram supports your problem statement well.\n• Consider detailing the connection between the visual components and your approach.',
      }
    }

    // Extract the user's actual question from the prompt
    const userQuestionMatch = prompt.match(/"([^"]+)"/)
    const userQuestion = userQuestionMatch ? userQuestionMatch[1] : prompt

    // Return contextual mock response based on user question
    if (prompt.includes('guidance') || prompt.includes('missing')) {
      return {
        content: '• Consider adding more context to your problem statement\n• Your approach could benefit from clearer steps\n• Think about potential edge cases',
      }
    }

    if (prompt.includes('reflection') || prompt.includes('summary')) {
      return {
        content: 'This submission shows early problem framing. The approach demonstrates structured thinking.',
      }
    }

    if (prompt.includes('coding') || prompt.includes('practice') || prompt.includes('code')) {
      return {
        content: 'Your explanation shows good problem-solving approach. Consider documenting your thought process more clearly.',
      }
    }

    if (prompt.includes('weekly') || prompt.includes('growth')) {
      return {
        content: 'This week shows consistent practice. You\'ve maintained regular submissions and demonstrated growth in problem-solving.',
      }
    }

    // Handle general project/idea questions
    if (userQuestion.toLowerCase().includes('project') || userQuestion.toLowerCase().includes('build')) {
      return {
        content: `Great! You're thinking about building a project. Here's some guidance to help you structure your thinking:

• **Define the Problem**: What specific problem are you trying to solve? Be clear about who has this problem and why it matters.

• **Scope Your Approach**: Break down your project into smaller, manageable components. What's the minimum viable version you could build first?

• **Consider Your Resources**: What skills, tools, or technologies do you already have? What might you need to learn?

• **Think About Impact**: How will you know if your project is successful? What metrics or outcomes matter?

Remember, the best projects start with clear problem definition. Take time to think through the "why" before jumping into the "how".`,
      }
    }

    // Default response for general queries
    return {
      content: `I'd be happy to help you think through "${userQuestion}". 

Here are some questions to guide your thinking:
• What specific aspect of this are you most curious about?
• What have you already considered or tried?
• What would success look like for you?

For now, I'm providing guidance to help structure your thinking process while the full logical engine initializes.`,
    }
  }

  async chat(messages: { role: string, content: string | any[] }[]): Promise<AIResponse> {
    const lastMessage = messages[messages.length - 1]?.content
    const textContent = typeof lastMessage === 'string' ? lastMessage : 'Image/Multi-modal content'
    return this.call(textContent)
  }
}

/**
 * Factory function to get AI service instance
 */
export function getAIService(config?: AIServiceConfig): BaseAIService {
  const apiKey = config?.apiKey || process.env.OPENAI_API_KEY

  if (apiKey) {
    return new OpenAIService(config)
  }

  // Use Ollama as primary local provider
  return new OllamaService(config)
}
