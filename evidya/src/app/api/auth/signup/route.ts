import { NextRequest, NextResponse } from 'next/server'
import { createUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { name, email, password, college, areaOfInterest, shortGoal } = await req.json()

  try {
    if (!email || !name || !password) {
      return NextResponse.json({ error: 'Name, email, and password required' }, { status: 400 })
    }

    const user = await createUser({
      name,
      email,
      password,
      college,
      areaOfInterest,
      shortGoal
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}