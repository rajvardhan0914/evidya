import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIService } from '@/lib/ai/aiService'
import { performSafetyCheck, sanitizeAIOutput } from '@/lib/ai/safety'

// GET /api/ai/chats/[chatId] - Get messages for a chat
export async function GET(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Await params for Next.js 15+ compatibility
        const { chatId } = await params

        const chat = await prisma.chat.findUnique({
            where: { id: chatId },
        })

        if (!chat || chat.userId !== userId) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
        }

        const messages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' },
        })

        // Map to simple structure
        const mappedMessages = messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            timestamp: m.createdAt.getTime()
        }))

        return NextResponse.json({ chat, messages: mappedMessages })
    } catch (error: any) {
        console.error('Error fetching chat details:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// DELETE /api/ai/chats/[chatId] - Delete a chat
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { chatId } = await params

        const chat = await prisma.chat.findUnique({ where: { id: chatId } })
        if (!chat || chat.userId !== userId) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        await prisma.chat.delete({ where: { id: chatId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
    }
}

// POST /api/ai/chats/[chatId] - Send message
export async function POST(req: NextRequest, { params }: { params: Promise<{ chatId: string }> }) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const { chatId } = await params
        const { message, model, temperature, maxTokens, responseStyle } = await req.json()

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

        // Verify chat ownership
        const chat = await prisma.chat.findUnique({ where: { id: chatId } })
        if (!chat || chat.userId !== userId) {
            return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
        }

        // Safety check
        const safetyCheck = await performSafetyCheck(userId, message)
        if (!safetyCheck.allowed) {
            return NextResponse.json({ error: safetyCheck.reason || 'Safety check failed' }, { status: 403 })
        }

        // Save User Message
        await prisma.message.create({
            data: {
                chatId,
                role: 'user',
                content: message
            }
        })

        // Fetch full history for context
        const allMessages = await prisma.message.findMany({
            where: { chatId },
            orderBy: { createdAt: 'asc' }
        })

        // Update Title if it's the first message (or title is "New Chat")
        if (chat.title === 'New Chat' || allMessages.length <= 2) {
            // Simple title generation: First 30 chars of message
            const newTitle = message.slice(0, 30) + (message.length > 30 ? '...' : '')
            await prisma.chat.update({
                where: { id: chatId },
                data: { title: newTitle }
            })
        }

        // Prepare context for AI
        const aiService = getAIService({
            model: model || 'gpt-4',
            temperature: temperature || 0.7,
            maxTokens: maxTokens || 1000,
        })

        // Dynamic System Prompt (Reused from existing logic)
        let systemInstruction = ''
        switch (responseStyle) {
            case 'concise':
                systemInstruction = `• Be extremely concise and to the point.\n• Avoid fluff.`
                break
            case 'detailed':
                systemInstruction = `• Provide comprehensive, detailed explanations.`
                break
            case 'balanced':
            default:
                systemInstruction = `• Be clear and supportive.\n• Balance brevity with detail.`
                break
        }

        const systemPrompt = `You are a thinking mentor helping a student. 
Your role is to provide GUIDANCE only. Do NOT solve problems for them.
Style Instructions:\n${systemInstruction}`

        const contextMessages = [
            { role: 'system', content: systemPrompt },
            ...allMessages.map((m: any) => ({
                role: m.role,
                content: m.content
            }))
        ]

        // Call AI
        const response = await aiService.chat(contextMessages)

        if (response.error) {
            throw new Error(response.error)
        }

        const sanitizedResponse = sanitizeAIOutput(response.content)

        // Save AI Message
        const savedAiMsg = await prisma.message.create({
            data: {
                chatId,
                role: 'assistant',
                content: sanitizedResponse
            }
        })

        // Touch chat updated time
        await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
        })

        return NextResponse.json({
            response: sanitizedResponse,
            messageId: savedAiMsg.id
        })

    } catch (error: any) {
        console.error('Chat error:', error)
        return NextResponse.json({ error: error.message || 'Internal Error' }, { status: 500 })
    }
}
