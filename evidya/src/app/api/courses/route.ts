import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const level = searchParams.get('level')
        const stream = searchParams.get('stream')
        const category = searchParams.get('category')

        const where: any = {}
        if (level) where.level = level
        if (stream) where.stream = stream
        if (category) where.category = category

        const courses = await prisma.course.findMany({
            where,
            include: {
                _count: {
                    select: { topics: true }
                }
            },
            orderBy: { order: 'asc' }
        })

        return NextResponse.json(courses)
    } catch (error: any) {
        console.error('Courses API Error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
