import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { getAIService } from '@/lib/ai'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { code, explanation, timeTaken, language } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Code is required' }, { status: 400 })
    }

    // Coding Feedback Logic (No improvements, just pattern analysis)
    const prompt = `
    [ROLE]
    You are a Senior Engineer Mentor.
    
    [INPUT]
    Language: ${language}
    Code Length: ${code.length} chars
    Time Taken: ${timeTaken} seconds
    Explanation: ${explanation}
    
    [TASK]
    Analyze the *approach* described in the explanation vs the code complexity.
    Do NOT correct the code.
    Do NOT provide a solution.
    Comment on:
    1. Clarity of thought (based on explanation)
    2. Efficiency of approach
    `

    const aiService = getAIService({ model: 'codellama', temperature: 0.3 })
    const aiResponse = await aiService.call(prompt)

    if (aiResponse.error) {
      // Fallback to simpler model if codellama missing
      const retryService = getAIService({ model: 'llama3', temperature: 0.3 })
      const retry = await retryService.call(prompt)
      if (retry.error) {
        return NextResponse.json({ error: retry.error }, { status: 500 })
      }
      return NextResponse.json({ feedback: retry.content })
    }

    // Save insight
    try {
      const userId = (session.user as any).id
      if (userId) {
        await prisma.aiInsight.create({
          data: {
            userId,
            relatedType: 'coding',
            insightText: aiResponse.content,
            cached: false
          }
        })
      }
    } catch (e) {
      console.warn('DB Issue saving coding insight', e)
    }

    return NextResponse.json({ feedback: aiResponse.content })

  } catch (error: unknown) {
    console.error('Coding Feedback API Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
