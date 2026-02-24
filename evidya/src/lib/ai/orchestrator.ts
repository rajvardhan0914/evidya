/**
 * AI ORCHESTRATOR
 * 
 * The central brain that decides WHEN and HOW to call the AI.
 * It strictly adheres to the "Guide, don't Solve" philosophy.
 */

import { evaluateIdea, evaluateCoding, evaluateActivity } from './ruleEngine'
import { getAIService } from './aiService'
import { PROMPTS } from './prompts'

export interface OrchestratorDecision {
  shouldCallAI: boolean
  promptIdentifier?: string
  context?: Record<string, any>
}

export interface OrchestratorContext {
  userId: string
  actionType: string
}

export class AIOrchestrator {
  private aiService = getAIService()

  /**
   * Decide if pre-submission guidance is needed
   */
  decideIdeaGuidance(problemStatement: string, approach: string, fileContent?: string | null): OrchestratorDecision {
    const analysis = evaluateIdea({ problemStatement, approach })

    return {
      shouldCallAI: analysis.shouldCallAI,
      promptIdentifier: 'idea_guidance',
      context: {
        problemStatement,
        approach,
        fileContent: fileContent || null,
        flags: analysis.flags,
        signals: analysis.signals
      }
    }
  }

  /**
   * Decide if post-submission reflection is needed
   */
  decideIdeaReflection(problemStatement: string, approach: string, wordCount: number, fileContent?: string | null): OrchestratorDecision {
    const analysis = evaluateIdea({ problemStatement, approach, wordCount })

    return {
      shouldCallAI: !!(analysis.shouldCallAI && analysis.signals.qualityThreshold),
      promptIdentifier: 'idea_reflection',
      context: {
        problemStatement,
        approach,
        wordCount,
        fileContent: fileContent || null
      }
    }
  }

  /**
   * Decide if coding feedback is needed
   */
  decideCodingFeedback(
    explanation?: string,
    timeTaken?: number,
    codeLength?: number,
    challengeTitle?: string
  ): OrchestratorDecision {
    const analysis = evaluateCoding({
      explanation,
      timeTaken,
      codeLength: codeLength || 0
    })

    return {
      shouldCallAI: analysis.shouldCallAI,
      promptIdentifier: 'coding_feedback',
      context: {
        explanation: explanation || 'No explanation provided',
        timeTaken: timeTaken || 0,
        timeTakenMinutes: Math.floor((timeTaken || 0) / 60),
        codeLength: codeLength || 0,
        challengeTitle: challengeTitle || 'Unknown Challenge'
      }
    }
  }

  /**
   * Decide if weekly growth reflection is needed
   */
  decideWeeklyGrowth(activityCount: number, consistency: boolean): OrchestratorDecision {
    return {
      shouldCallAI: activityCount > 0,
      promptIdentifier: 'weekly_reflection',
      context: {
        activityCount,
        consistency,
        activitySummary: `User had ${activityCount} activities.`,
        consistencyPattern: consistency ? 'Consistent activity' : 'Varying activity',
        recentHighlights: 'Continued growth and practice'
      }
    }
  }

  /**
   * Legacy method for backward compatibility with simple routes
   */
  async processIdeaSubmission(title: string, problem: string, approach: string, fileContent?: string | null) {
    const decision = this.decideIdeaGuidance(problem, approach, fileContent)
    if (!decision.shouldCallAI) {
      return {
        shouldCallAI: false,
        signals: [],
        guidance: ['Your idea needs more depth before AI analysis. Try expanding on the problem statement.']
      }
    }

    // Inject title into context for better results
    decision.context = { ...decision.context, title }

    try {
      const aiResponse = await this.executeDecision(decision)
      return {
        shouldCallAI: true,
        signals: [],
        aiResponse
      }
    } catch (error) {
      console.error('Legacy orchestrator call failed:', error)
      return {
        shouldCallAI: false,
        signals: [],
        guidance: ['AI Service is currently unavailable.']
      }
    }
  }

  /**
   * Execute a decided AI call
   */
  async executeDecision(decision: OrchestratorDecision): Promise<string> {
    if (!decision.shouldCallAI) {
      throw new Error('AI call not recommended by rule engine')
    }

    const promptTemplate = PROMPTS[decision.promptIdentifier as keyof typeof PROMPTS]
    if (!promptTemplate) {
      throw new Error(`Unknown prompt template: ${decision.promptIdentifier}`)
    }

    // Simple template string replacement
    let prompt: string = promptTemplate as string
    if (decision.context) {
      Object.entries(decision.context).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        prompt = prompt.replace(new RegExp(placeholder, 'g'), String(value))
      })
    }

    const response = await this.aiService.call(prompt, undefined, decision.context?.fileContent)
    if (response.error) {
      throw new Error(response.error)
    }

    return response.content
  }
}

export const aiOrchestrator = new AIOrchestrator()
