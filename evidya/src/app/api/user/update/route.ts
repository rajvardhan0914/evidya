import { NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!session?.user || !(session.user as any).id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { name, shortGoal, college, areaOfInterest, bio, location, skills, image, coverImage } = await req.json()
        const userId = (session.user as any).id

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                name,
                shortGoal,
                institution: college,
                interestDomain: areaOfInterest,
                bio,
                location,
                skills,
                image,
                coverImage,
            },
        })

        return NextResponse.json(updatedUser)
    } catch (error: any) {
        console.error('Profile Update Error:', error)
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
    }
}
