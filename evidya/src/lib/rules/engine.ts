/**
 * RULE ENGINE (Non-AI Logic Layer)
 * 
 * Evaluates user inputs against strict logical criteria before any AI call.
 * This ensures bandwidth is not wasted on low-quality inputs and provides
 * determininstic feedback.
 */

export type SignalType =
    | 'NEEDS_DEPTH'
    | 'GOOD_STRUCTURE'
    | 'CONSISTENT_STREAK'
    | 'INACTIVITY_RISK'
    | 'RAPID_ITERATION'
    | 'READY_FOR_AI'

export interface analysisResult {
    signals: SignalType[]
    metrics: {
        wordCount: number
        readabilityScore: number // Simple heuristic
    }
    shouldCallAI: boolean
}

const MIN_WORD_COUNT = 50 // Minimum words for a "serious" idea

export const normalizeText = (text: string) => text.trim().replace(/\s+/g, ' ')

export function analyzeIdea(title: string, problem: string, approach: string): analysisResult {
    const fullText = `${title} ${problem} ${approach}`
    const words = normalizeText(fullText).split(' ').length

    const signals: SignalType[] = []

    // Rule 1: Depth Check
    if (words < MIN_WORD_COUNT) {
        signals.push('NEEDS_DEPTH')
    } else {
        signals.push('GOOD_STRUCTURE')
    }

    // Future Rule: Check for "how to" vs "what is" (heuristic for actionable ideas)

    return {
        signals,
        metrics: {
            wordCount: words,
            readabilityScore: 0 // Placeholder
        },
        shouldCallAI: !signals.includes('NEEDS_DEPTH')
    }
}

export function analyzeConsistency(lastActivityDate: Date | null): SignalType[] {
    if (!lastActivityDate) return []

    const now = new Date()
    const daysDiff = Math.floor((now.getTime() - lastActivityDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff > 7) return ['INACTIVITY_RISK']
    if (daysDiff <= 1) return ['CONSISTENT_STREAK']

    return []
}
