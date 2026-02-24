/**
 * API: General AI Chat
 * 
 * A general-purpose AI chat endpoint that uses the idea guidance module
 * for any user query. This provides a flexible interface for the AI page.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { performSafetyCheck, sanitizeAIOutput } from '@/lib/ai/safety'
import { SYSTEM_PROMPTS } from '@/lib/ai/prompts'
import { getAIService } from '@/lib/ai/aiService'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages: history, model, temperature, maxTokens, responseStyle } = await req.json()

    if (!history || history.length === 0) {
      return NextResponse.json(
        { error: 'Chat history matches is required' },
        { status: 400 }
      )
    }

    const lastMessage = history[history.length - 1].content

    // Safety check on the new message
    const safetyCheck = await performSafetyCheck(userId, lastMessage)
    if (!safetyCheck.allowed) {
      return NextResponse.json(
        { error: safetyCheck.reason || 'Safety check failed' },
        { status: 403 }
      )
    }

    // Use AI service directly for general chat
    const aiService = getAIService({
      model: model || 'gpt-4',
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 1000,
    })

    // Generate dynamic system prompt based on preferences
    let systemInstruction = ''

    switch (responseStyle) {
      case 'concise':
        systemInstruction = `
• Be extremely concise and to the point.
• Avoid fluff, filler words, or unnecessary politeness.
• Get straight to the answer or guidance.
• Use bullet points where possible for brevity.`
        break
      case 'detailed':
        systemInstruction = `
• Provide comprehensive, detailed explanations.
• Use examples, analogies, and deep context.
• Explore edge cases and related concepts.
• Break down complex ideas into thorough step-by-step guides.`
        break
      case 'balanced':
      default:
        systemInstruction = `
• Be clear and supportive.
• Balance brevity with necessary detail.
• Focus on helping them think better.`
        break
    }

    const systemPrompt = `You are a thinking mentor helping a student. 
Your role is to provide GUIDANCE only. Do NOT solve problems for them. Do NOT write code. Do NOT provide complete solutions.
Instead, provide:
• Structured guidance on how to think about the problem
• Questions to help them explore the topic
• Encouragement to think through it themselves

Style Instructions:${systemInstruction}`

    // Construct context with system prompt
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...history.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ]

    const response = await aiService.chat(fullMessages)

    if (response.error) {
      return NextResponse.json(
        { error: response.error },
        { status: 500 }
      )
    }

    const sanitized = sanitizeAIOutput(response.content)

    return NextResponse.json({
      response: sanitized,
      model: model || 'gpt-4',
    })
  } catch (error: any) {
    console.error('AI chat error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
