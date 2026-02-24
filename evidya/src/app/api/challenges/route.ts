import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthSession } from '@/lib/auth'

export const maxDuration = 60

export async function GET() {
  try {
    const challenges = await prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            institution: true
          }
        }
      }
    })
    return NextResponse.json(challenges)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch challenges' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = (session.user as any).id
    const userRole = (session.user as any).role
    const isVerified = (session.user as any).isVerified

    if (userRole !== 'COMPANY' && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only companies can post challenges' }, { status: 403 })
    }

    if (!isVerified && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Your account is pending verification' }, { status: 403 })
    }

    const { title, description, reward, type } = await req.json()

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }

    const challenge = await prisma.challenge.create({
      data: {
        userId,
        companyName: session.user.name || 'Anonymous Company',
        title,
        description,
        reward,
        type: type || 'OPEN',
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(challenge)
  } catch (error: any) {
    console.error('Challenge creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}