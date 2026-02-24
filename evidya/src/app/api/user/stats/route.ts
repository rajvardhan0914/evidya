import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getAuthSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = session.user.id
  const [ideasCount, practiceCount] = await Promise.all([
    prisma.idea.count({ where: { userId } }),
    prisma.submission.count({ where: { userId } }),
  ])

  return NextResponse.json({
    ideasCount,
    practiceCount,
  })
}