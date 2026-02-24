import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        const course = await prisma.course.findUnique({
            where: { id },
            include: {
                topics: {
                    include: {
                        subtopics: {
                            orderBy: { order: 'asc' }
                        }
                    },
                    orderBy: { order: 'asc' }
                }
            }
        })

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 })
        }

        return NextResponse.json(course)
    } catch (error: any) {
        console.error('Course Detail API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
