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
      const logs = await prisma.activityLog.findMany({
        where: { userId: (session.user as any).id },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })
      return NextResponse.json(logs)
    } catch (dbError) {
      console.error('Database access failed, returning empty logs:', dbError)
      // Fallback for MVP/Demo when DB is not connected
      return NextResponse.json([])
    }
  } catch (error: any) {
    console.error('Activity API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}