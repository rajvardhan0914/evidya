/**
 * Memory System
 * 
 * Two memory layers:
 * 1. Short-term context (recent submissions, last AI insight)
 * 2. Long-term memory (stored in DB, used for future reflections)
 */

import { prisma } from '@/lib/prisma'

export interface ShortTermContext {
  recentIdeas: Array<{
    id: string
    title: string
    problem: string
    createdAt: Date
  }>
  recentSubmissions: Array<{
    id: string
    challengeId: string
    createdAt: Date
  }>
  lastAiInsight?: {
    type: string
    text: string
    createdAt: Date
  }
}

export interface LongTermMemory {
  totalIdeas: number
  totalSubmissions: number
  consistencyStreak: number
  lastActivityDate: Date | null
  growthPatterns: string[]
}

/**
 * Get short-term context for a user
 */
export async function getShortTermContext(
  userId: string,
  limit: number = 5
): Promise<ShortTermContext> {
  const [recentIdeas, recentSubmissions, lastInsight] = await Promise.all([
    prisma.idea.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        problem: true,
        createdAt: true,
      },
    }),
    prisma.submission.findMany({
      where: { userId },
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        challengeId: true,
        createdAt: true,
      },
    }),
    prisma.aiInsight.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        relatedType: true,
        insightText: true,
        createdAt: true,
      },
    }),
  ])

  return {
    recentIdeas,
    recentSubmissions,
    lastAiInsight: lastInsight
      ? {
        type: lastInsight.relatedType,
        text: lastInsight.insightText,
        createdAt: lastInsight.createdAt,
      }
      : undefined,
  }
}

/**
 * Get long-term memory for a user
 */
export async function getLongTermMemory(userId: string): Promise<LongTermMemory> {
  const [totalIdeas, totalSubmissions, lastActivity, activities] = await Promise.all([
    prisma.idea.count({ where: { userId } }),
    prisma.submission.count({ where: { userId } }),
    prisma.activityLog.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    }),
    prisma.activityLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { actionType: true, createdAt: true },
    }),
  ])

  // Calculate consistency streak (consecutive days with activity)
  let consistencyStreak = 0
  if (activities.length > 0) {
    const activityDates = new Set(
      activities.map((a: any) =>
        a.createdAt.toISOString().split('T')[0]
      )
    )
    const sortedDates = Array.from(activityDates).sort().reverse()

    for (let i = 0; i < sortedDates.length; i++) {
      const date = new Date(sortedDates[i] as string)
      const expectedDate = new Date()
      expectedDate.setDate(expectedDate.getDate() - i)

      if (
        date.toISOString().split('T')[0] ===
        expectedDate.toISOString().split('T')[0]
      ) {
        consistencyStreak++
      } else {
        break
      }
    }
  }

  // Identify growth patterns
  const growthPatterns: string[] = []
  if (consistencyStreak >= 7) {
    growthPatterns.push('strong_consistency')
  }
  if (totalIdeas >= 10) {
    growthPatterns.push('high_idea_count')
  }
  if (totalSubmissions >= 20) {
    growthPatterns.push('high_practice_count')
  }

  return {
    totalIdeas,
    totalSubmissions,
    consistencyStreak,
    lastActivityDate: lastActivity?.createdAt || null,
    growthPatterns,
  }
}

/**
 * Check if insight should be cached (avoid repeated AI calls)
 */
export async function getCachedInsight(
  userId: string,
  relatedType: string,
  relatedId: string | null
): Promise<string | null> {
  const insight = await prisma.aiInsight.findFirst({
    where: {
      userId,
      relatedType,
      relatedId: relatedId || null,
      cached: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Cache valid for 24 hours
  if (insight) {
    const hoursSinceCreation =
      (Date.now() - insight.createdAt.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCreation < 24) {
      return insight.insightText
    }
  }

  return null
}

/**
 * Cache an insight
 */
export async function cacheInsight(
  userId: string,
  relatedType: string,
  relatedId: string | null,
  insightText: string
): Promise<void> {
  await prisma.aiInsight.create({
    data: {
      userId,
      relatedType,
      relatedId: relatedId || null,
      insightText,
      cached: true,
    },
  })
}
