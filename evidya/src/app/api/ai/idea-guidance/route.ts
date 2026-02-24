/**
 * API: Idea Guidance (PRE-SUBMISSION)
 * 
 * Provides guidance on draft idea before submission.
 * Does NOT rewrite or add ideas.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getAuthSession } from '@/lib/auth'
import { aiOrchestrator } from '@/lib/ai/orchestrator'
import { prisma } from '@/lib/prisma'

export const maxDuration = 60; // 1 minute timeout for large files

export async function POST(req: NextRequest) {
  try {
    const session = await getAuthSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await req.formData()
    const title = formData.get('title') as string
    const problem = formData.get('problem') as string
    const approach = formData.get('approach') as string
    const file = formData.get('files') as File | null

    if (!title || !problem) {
      return NextResponse.json(
        { error: 'Title and problem statement are required' },
        { status: 400 }
      )
    }

    let fileContent: string | null = null
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      // Basic safeguard: limit to ~15MB
      if (buffer.length > 15 * 1024 * 1024) {
        return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 413 })
      }
      fileContent = buffer.toString('base64')
    }

    // Process through AI Orchestrator
    const result = await aiOrchestrator.processIdeaSubmission(
      title,
      problem,
      approach || '',
      fileContent
    )

    // Log the activity (Fire and forget, or await if critical)
    try {
      const userId = (session.user as any).id
      if (userId) {
        await prisma.activityLog.create({
          data: {
            userId,
            actionType: 'idea_guidance_requested',
            metadata: JSON.stringify({
              signals: result.signals,
              calledAI: result.shouldCallAI
            })
          }
        })
      }
    } catch (e) {
      console.warn('Failed to log activity (DB might be locked/offline)', e)
    }

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('Idea Guidance API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
