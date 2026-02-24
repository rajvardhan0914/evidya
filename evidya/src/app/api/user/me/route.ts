import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getAuthSession()
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
      const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: {
          id: true,
          name: true,
          email: true,
          institution: true, // Renamed from college
          interestDomain: true, // Renamed from areaOfInterest
          shortGoal: true,
          image: true,
          coverImage: true,
          bio: true,
          location: true,
          skills: true,
        },
      })

      if (!user) {
        // Fallback to session user if DB user not found (common in MVP/Demo)
        return NextResponse.json({
          ...session.user,
          college: 'Not set',
          areaOfInterest: 'Not set',
          shortGoal: 'Not set'
        })
      }

      // Map back to legacy frontend names if needed
      return NextResponse.json({
        ...user,
        college: user.institution,
        areaOfInterest: user.interestDomain
      })
    } catch (dbError) {
      console.warn('Database access failed for /me, falling back to session:', dbError)
      // Fallback if DB is down
      return NextResponse.json({
        ...session.user,
        college: 'Not set (DB Offline)',
        areaOfInterest: 'Not set (DB Offline)',
        shortGoal: 'Database connection failed'
      })
    }
  } catch (error: any) {
    console.error('User Me API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
