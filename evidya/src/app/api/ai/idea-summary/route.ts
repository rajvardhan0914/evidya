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

    const { title, problem, approach, ideaId } = await req.json()

    if (!title || !problem) {
      return NextResponse.json({ error: 'Missing idea details' }, { status: 400 })
    }

    // AI Reflection Logic
    const prompt = `
    [ROLE]
    You are a Reflective Analyst.
    
    [INPUT]
    Title: ${title}
    Problem: ${problem}
    Approach: ${approach}
    
    [TASK]
    Provide a 2-3 line summary of the *thinking pattern* shown here. 
    Focus on how they framed the problem.
    Do NOT summarize the idea itself.
    `

    const aiService = getAIService({ model: 'llama3', temperature: 0.5 })
    const aiResponse = await aiService.call(prompt)

    if (aiResponse.error) {
      return NextResponse.json({ error: aiResponse.error }, { status: 500 })
    }

    // Save insight to DB
    try {
      const userId = (session.user as any).id
      if (userId) {
        await prisma.aiInsight.create({
          data: {
            userId,
            relatedType: 'idea',
            relatedId: ideaId, // Optional correlation
            insightText: aiResponse.content,
            cached: false
          }
        })
      }
    } catch (e) {
      console.warn('Failed to save insight (DB Issue)', e)
    }

    return NextResponse.json({ insight: aiResponse.content })

  } catch (error: any) {
    console.error('Idea Summary API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
