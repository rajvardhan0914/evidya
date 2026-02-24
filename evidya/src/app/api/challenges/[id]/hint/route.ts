import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getAIService } from '@/lib/ai/aiService'

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getAuthSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { code } = await req.json()

        const challenge = await prisma.codingChallenge.findUnique({
            where: { id }
        })

        if (!challenge) {
            return NextResponse.json({ error: 'Challenge not found' }, { status: 404 })
        }

        const aiService = getAIService()
        const prompt = `
You are a programming mentor. A student is working on the following coding challenge:

Title: ${challenge.title}
Description: ${challenge.description}

Their current code is:
\`\`\`
${code || '// No code written yet'}
\`\`\`

Provide a single, short, encouraging hint (maximum 3 sentences) that helps them progress without giving away the direct solution or code. Do NOT write code in your response.
`

        const response = await aiService.call(prompt, "You are a helpful programming tutor who gives hints, not answers.")

        if (response.error) {
            return NextResponse.json({ error: response.error }, { status: 500 })
        }

        return NextResponse.json({ hint: response.content })
    } catch (error: any) {
        console.error('Hint generation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
