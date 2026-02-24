/**
 * API: Weekly Growth Reflection
 * 
 * Generates weekly growth narrative based on activity patterns.
 * Runs once per week per user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { WeeklyGrowthModule } from '@/lib/ai/modules'
import { AIOrchestrator } from '@/lib/ai/orchestrator'
import { prisma } from '@/lib/prisma'
import { shouldTriggerWeeklyReflection } from '@/lib/ai/ruleEngine'
import { sanitizeAIOutput } from '@/lib/ai/safety'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if weekly reflection should be triggered
    const lastWeeklyInsight = await prisma.aiInsight.findFirst({
      where: {
        userId: session.user.id,
        relatedType: 'weekly',
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Get activity count for last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const activityCount = await prisma.activityLog.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    })

    const shouldTrigger = shouldTriggerWeeklyReflection(
      lastWeeklyInsight?.createdAt || null,
      activityCount
    )

    if (!shouldTrigger) {
      return NextResponse.json(
        {
          message: 'Weekly reflection not triggered (insufficient activity or too soon)',
        },
        { status: 200 }
      )
    }

    // Initialize AI modules
    const orchestrator = new AIOrchestrator()
    const weeklyModule = new WeeklyGrowthModule(orchestrator)

    // Generate reflection
    const reflection = await weeklyModule.generateWeeklyReflection(session.user.id)

    if (!reflection) {
      return NextResponse.json(
        { message: 'Weekly reflection not generated' },
        { status: 200 }
      )
    }

    // Sanitize output
    const sanitized = sanitizeAIOutput(reflection)

    return NextResponse.json({ reflection: sanitized })
  } catch (error: any) {
    console.error('Weekly reflection error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
