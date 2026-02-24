import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/ai/chats - List all chats for the user
export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chats = await prisma.chat.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return NextResponse.json(chats)
    } catch (error: any) {
        console.error('Error fetching chats:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST /api/ai/chats - Create a new chat
export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chat = await prisma.chat.create({
            data: {
                userId,
                title: 'New Chat',
            }
        })

        return NextResponse.json(chat)
    } catch (error: any) {
        console.error('Error creating chat:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
