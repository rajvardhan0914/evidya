import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        image: true,
        institution: true,
        interestDomain: true,
        ideas: { select: { id: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    const profiles = users.map((u: any) => ({
      id: u.id,
      name: u.name ?? 'Anonymous',
      image: u.image,
      college: u.institution ?? '—',
      areaOfInterest: u.interestDomain ?? '—',
      ideasCount: u.ideas.length,
    }))

    return NextResponse.json(profiles)
  } catch (error) {
    console.error('Profiles API Error:', error)
    // Fallback for MVP/Demo
    return NextResponse.json([])
  }
}