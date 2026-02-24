/**
 * Specialized AI Modules
 * 
 * Each module handles a specific AI task:
 * 1. Idea Guidance (pre-submission)
 * 2. Idea Reflection (post-submission)
 * 3. Coding Practice Feedback
 * 4. Weekly Growth Reflection
 */

import { AIOrchestrator } from './orchestrator'
import { prisma } from '@/lib/prisma'

export class IdeaGuidanceModule {
  constructor(private orchestrator: AIOrchestrator) { }

  /**
   * Provide guidance on draft idea (before submission)
   */
  async provideGuidance(
    userId: string,
    problemStatement: string,
    approach: string
  ): Promise<{ guidance: string; shouldProceed: boolean }> {
    const decision = this.orchestrator.decideIdeaGuidance(
      problemStatement,
      approach
    )

    if (!decision.shouldCallAI) {
      return {
        guidance: 'Your idea needs more depth before submission. Consider expanding your problem statement and approach.',
        shouldProceed: false,
      }
    }

    try {
      const guidance = await this.orchestrator.executeDecision(decision)
      return {
        guidance,
        shouldProceed: true,
      }
    } catch (error: any) {
      console.error('Idea guidance error:', error)
      return {
        guidance: 'Unable to generate guidance at this time. Please review your submission manually.',
        shouldProceed: true, // Allow submission even if AI fails
      }
    }
  }
}

export class IdeaReflectionModule {
  constructor(private orchestrator: AIOrchestrator) { }

  /**
   * Generate reflection after idea submission
   */
  async generateReflection(
    userId: string,
    ideaId: string,
    problemStatement: string,
    approach: string,
    fileContent?: string | null
  ): Promise<string | null> {
    const wordCount =
      (problemStatement?.split(/\s+/).length || 0) +
      (approach?.split(/\s+/).length || 0)

    const decision = this.orchestrator.decideIdeaReflection(
      problemStatement,
      approach,
      wordCount,
      fileContent
    )

    if (!decision.shouldCallAI) {
      return null // No reflection for low-quality submissions
    }

    try {
      const reflection = await this.orchestrator.executeDecision(decision)

      // Store insight in database
      await prisma.aiInsight.create({
        data: {
          userId,
          relatedType: 'idea',
          relatedId: ideaId,
          insightText: reflection,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          actionType: 'ai_insight_generated',
          referenceId: ideaId,
          metadata: JSON.stringify({ type: 'idea_reflection' }),
        },
      })

      return reflection
    } catch (error: any) {
      console.error('Idea reflection error:', error)
      return null // Fail gracefully
    }
  }
}

export class CodingFeedbackModule {
  constructor(private orchestrator: AIOrchestrator) { }

  /**
   * Provide feedback on coding submission
   */
  async provideFeedback(
    userId: string,
    submissionId: string,
    explanation: string | undefined,
    timeTaken: number | undefined,
    codeLength: number,
    challengeTitle?: string
  ): Promise<string | null> {
    const decision = this.orchestrator.decideCodingFeedback(
      explanation,
      timeTaken,
      codeLength,
      challengeTitle
    )

    if (!decision.shouldCallAI) {
      return null
    }

    try {
      const feedback = await this.orchestrator.executeDecision(decision)

      // Store insight
      await prisma.aiInsight.create({
        data: {
          userId,
          relatedType: 'coding',
          relatedId: submissionId,
          insightText: feedback,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          actionType: 'ai_insight_generated',
          referenceId: submissionId,
          metadata: JSON.stringify({ type: 'coding_feedback' }),
        },
      })

      return feedback
    } catch (error: any) {
      console.error('Coding feedback error:', error)
      return null
    }
  }
}

export class WeeklyGrowthModule {
  constructor(private orchestrator: AIOrchestrator) { }

  /**
   * Generate weekly growth reflection
   */
  async generateWeeklyReflection(userId: string): Promise<string | null> {
    // Get activity from last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activities = await prisma.activityLog.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    const activityCount = activities.length

    // Check for consistency
    const consistencyDetected = activityCount >= 5

    const decision = this.orchestrator.decideWeeklyGrowth(
      activityCount,
      consistencyDetected
    )

    if (!decision.shouldCallAI) {
      return null
    }

    // Build activity summary
    const activityTypes = activities.map((a: any) => a.actionType)
    const activitySummary = `User had ${activityCount} activities: ${activityTypes.join(', ')}`

    const consistencyPattern = consistencyDetected
      ? 'Strong consistency detected with regular submissions'
      : 'Moderate activity level'

    // Get recent highlights (ideas and submissions)
    const recentIdeas = await prisma.idea.findMany({
      where: {
        userId,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      take: 3,
      orderBy: {
        createdAt: 'desc',
      },
    })

    const recentHighlights = recentIdeas.length > 0
      ? `Recent ideas: ${recentIdeas.map((i: any) => i.title).join(', ')}`
      : 'Continued practice and engagement'

    // Update decision context
    decision.context = {
      ...decision.context,
      activitySummary,
      consistencyPattern,
      recentHighlights,
    }

    try {
      const reflection = await this.orchestrator.executeDecision(decision)

      // Store insight
      await prisma.aiInsight.create({
        data: {
          userId,
          relatedType: 'weekly',
          relatedId: null,
          insightText: reflection,
        },
      })

      // Log activity
      await prisma.activityLog.create({
        data: {
          userId,
          actionType: 'ai_insight_generated',
          referenceId: null,
          metadata: JSON.stringify({ type: 'weekly_reflection' }),
        },
      })

      return reflection
    } catch (error: any) {
      console.error('Weekly reflection error:', error)
      return null
    }
  }
}
