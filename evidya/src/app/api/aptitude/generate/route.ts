import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Fast Path: Fetch a random question from DB
        const count = await prisma.aptitudeQuestion.count()

        let questionData;

        if (count > 0) {
            const skip = Math.floor(Math.random() * count)
            const questions = await prisma.aptitudeQuestion.findMany({
                take: 1,
                skip: skip
            })
            questionData = questions[0]

            // Parse options if stored as string
            try {
                if (typeof questionData.options === 'string') {
                    questionData.options = JSON.parse(questionData.options)
                }
            } catch (e) { /* ignore */ }

        } else {
            // Fallback if DB is empty
            questionData = {
                type: 'Logical Reasoning',
                question: 'If all A are B and some B are C, which of the following is definitely true? (Fallback)',
                options: ['All A are C', 'Some A are C', 'Some B are A', 'No A are C'],
                correctAnswer: 'Some B are A',
                explanation: 'Fallback explanation due to empty database.'
            }
        }

        return NextResponse.json(questionData)

    } catch (error: any) {
        console.error('Aptitude generation error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
