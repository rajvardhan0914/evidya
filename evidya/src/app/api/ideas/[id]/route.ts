import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getAuthSession()
    console.log('API Idea Detail: Session check', { hasSession: !!session, userId: (session?.user as any)?.id })

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    console.log('API Idea Detail: Fetching ID', id)

    const idea = await prisma.idea.findUnique({
      where: { id },
      include: { user: { select: { name: true, institution: true } } },
    })

    if (!idea) {
      console.log('API Idea Detail: Idea not found for ID', id)
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Map fields to match frontend expectation
    const mappedIdea = {
      ...idea,
      problem: idea.problemStatement,
      user: {
        ...idea.user,
        college: idea.user.institution
      }
    }

    console.log('API Idea Detail: Success mapping idea', id)
    return NextResponse.json(mappedIdea)
  } catch (error: any) {
    console.error('API Idea Detail: CRITICAL ERROR', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}