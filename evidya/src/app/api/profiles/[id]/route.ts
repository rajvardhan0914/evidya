import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        institution: true,
        interestDomain: true,
        shortGoal: true,
        ideas: {
          select: { id: true, title: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Map fields to match frontend expectations
    return NextResponse.json({
      ...user,
      college: user.institution,
      areaOfInterest: user.interestDomain,
    })
  } catch (error: any) {
    console.error('Profile API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}