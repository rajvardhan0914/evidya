import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const challenges = await prisma.codingChallenge.findMany({
            orderBy: { createdAt: 'desc' },
        })
        return NextResponse.json(challenges)
    } catch (error) {
        console.error('Coding challenges fetch error:', error)
        return NextResponse.json({ error: 'Failed to fetch coding challenges' }, { status: 500 })
    }
}
