import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { getAIService } from '@/lib/ai/aiService'

export async function POST(req: NextRequest) {
    try {
        const session = await getAuthSession()
        const userId = (session?.user as any)?.id
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { text, prompt: assessmentPrompt } = await req.json()
        if (!text) {
            return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
        }

        const aiService = getAIService()
        const systemPrompt = "You are a communication and interview coach. You provide professional feedback in JSON format."
        const promptText = `
Analyze the following transcript of a person answering this interview question:
Question: "${assessmentPrompt || 'Tell us about yourself'}"
Transcript: "${text}"

Provide an evaluation in JSON format with these exact fields:
1. "fillerCount": number (count of "um", "uh", "actually", "like", etc).
2. "sentiment": string (e.g. "Confident", "Articulate", "Nervous").
3. "relevanceScore": number (0-100, how well they answered the specific question).
4. "feedback": string (4-5 bullet points of professional advice).

Return ONLY JSON.
`

        const response = await aiService.call(promptText, systemPrompt)

        const fallbackAnalysis = {
            fillerCount: (text.match(/um|uh|like|actually/gi) || []).length,
            sentiment: 'Determined',
            relevanceScore: 80,
            feedback: '• AI Mentor is currently offline, providing basic analysis.\n• Your enthusiasm is clear.\n• Try to pause more naturally between points to reduce fillers.\n• Structure your answer using the STAR method (Situation, Task, Action, Result).'
        }

        if (response.error) {
            console.error('Speech AI Service Error:', response.error)
            return NextResponse.json(fallbackAnalysis)
        }

        try {
            const jsonStr = response.content.replace(/```json|```/g, '').trim()
            const analysis = JSON.parse(jsonStr)
            return NextResponse.json(analysis)
        } catch (parseError) {
            return NextResponse.json(fallbackAnalysis)
        }
    } catch (error: any) {
        console.error('Speech analysis error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
