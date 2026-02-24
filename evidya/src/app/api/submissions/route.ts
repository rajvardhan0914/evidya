import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { challengeId, code, language, explanation, timeTaken } = await req.json()
  if (!challengeId || !code || !language) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const submission = await prisma.submission.create({
    data: {
      userId: session.user.id,
      challengeId,
      code,
      language,
      explanation: explanation || null,
      timeTaken: timeTaken || null,
    },
  })

  await prisma.activityLog.create({
    data: {
      userId: session.user.id,
      actionType: 'practice_completed',
      referenceId: submission.id,
      metadata: JSON.stringify({ challengeId, submissionId: submission.id }),
    },
  })

  // Generate AI feedback asynchronously (don't block response)
  if (explanation) {
    try {
      const { CodingFeedbackModule } = await import('@/lib/ai/modules')
      const { AIOrchestrator } = await import('@/lib/ai/orchestrator')
      const orchestrator = new AIOrchestrator()
      const feedbackModule = new CodingFeedbackModule(orchestrator)
      
      // Get challenge title if available
      const challenge = await prisma.codingChallenge.findUnique({
        where: { id: challengeId },
        select: { title: true },
      })
      
      // Fire and forget - don't await
      feedbackModule.provideFeedback(
        session.user.id,
        submission.id,
        explanation,
        timeTaken,
        code.length,
        challenge?.title
      ).catch(err => {
        console.error('AI feedback generation failed:', err)
        // Fail silently - AI is optional
      })
    } catch (error) {
      // AI system not available - that's okay
      console.warn('AI feedback not available:', error)
    }
  }

  return NextResponse.json(submission)
}