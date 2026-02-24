import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'

const PROMPTS = [
    {
        id: '1',
        title: 'Behavioral: Conflict Resolution',
        scenario: 'Describe a situation where you had a conflict with a team member. How did you resolve it and what was the outcome?'
    },
    {
        id: '2',
        title: 'Situational: Overcoming Failure',
        scenario: 'Tell us about a time you failed to meet a deadline or goal. What did you learn from the experience?'
    },
    {
        id: '3',
        title: 'Leadership: Initiative',
        scenario: 'Give an example of a time when you took the lead on a project or initiative without being asked.'
    },
    {
        id: '4',
        title: 'Communication: Complex Concepts',
        scenario: 'How would you explain a complex technical concept to someone with no background in the field?'
    },
    {
        id: '5',
        title: 'Adaptability: Change',
        scenario: 'Describe a time when you had to adapt to a major change at work or in a project. How did you handle it?'
    }
]

export async function GET(req: NextRequest) {
    try {
        const session = await getAuthSession()
        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)]
        return NextResponse.json(randomPrompt)
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
