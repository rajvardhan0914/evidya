import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60; // 1 minute timeout for large files

export async function GET() {
  try {
    const ideas = await prisma.idea.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            institution: true,
          },
        },
      },
    })

    // Map for frontend compatibility
    const mappedIdeas = ideas.map((idea: any) => ({
      ...idea,
      user: {
        ...idea.user,
        college: idea.user.institution
      }
    }))

    return NextResponse.json(mappedIdeas)
  } catch (error) {
    console.warn('Ideas API Error:', error)
    return NextResponse.json([])
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession()
  if (!(session?.user as any)?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const title = formData.get('title') as string
  const problem = formData.get('problem') as string
  const approach = formData.get('approach') as string
  const file = formData.get('files') as File | null

  if (!title || !problem || !approach) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  let fileContent: string | null = null
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    // Basic safeguard: limit to ~15MB
    if (buffer.length > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 413 })
    }
    fileContent = buffer.toString('base64')
  }

  const userId = (session!.user as any).id

  const idea = await prisma.idea.create({
    data: {
      userId,
      title,
      problemStatement: problem, // Mapped to new schema field
      approach,
      files: fileContent,
    },
  })

  await prisma.activityLog.create({
    data: {
      userId,
      actionType: 'idea_submitted',
      referenceId: idea.id, // Fixed: idea has id
      metadata: JSON.stringify({ ideaId: idea.id, title }),
    },
  })

  // Generate AI reflection
  try {
    const { IdeaReflectionModule } = await import('@/lib/ai/modules')
    const { AIOrchestrator } = await import('@/lib/ai/orchestrator')
    const orchestrator = new AIOrchestrator()
    const reflectionModule = new IdeaReflectionModule(orchestrator)

    reflectionModule.generateReflection(
      userId,
      idea.id,
      problem,
      approach,
      fileContent
    ).catch(err => {
      console.error('AI reflection generation failed:', err)
    })
  } catch (error) {
    console.warn('AI reflection not available:', error)
  }

  return NextResponse.json(idea)
}