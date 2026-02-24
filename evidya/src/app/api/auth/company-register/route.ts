import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hash } from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const { name, email, password, companyWebsite, linkedIn, intent } = await req.json()

        if (!name || !email || !password || !companyWebsite) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const hashedPassword = await hash(password, 12)

        const user = await prisma.user.create({
            data: {
                name,
                email,
                hashedPassword,
                role: 'COMPANY',
                isVerified: false,
                companyDetails: JSON.stringify({
                    website: companyWebsite,
                    linkedIn,
                    intent
                })
            }
        })

        return NextResponse.json({ success: true, userId: user.id })
    } catch (error: any) {
        console.error('Company register error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
