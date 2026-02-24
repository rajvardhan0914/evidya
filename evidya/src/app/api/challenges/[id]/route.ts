import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const challenge = await prisma.codingChallenge.findUnique({
      where: { id }
    })

    if (!challenge) {
      return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
    }

    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Error fetching challenge:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}