/**
 * Rule Engine - Pure Logic Layer (NO AI)
 * 
 * Evaluates user submissions based on objective metrics:
 * - Word count
 * - Submission frequency
 * - Time gaps
 * - Iteration patterns
 * - Consistency streaks
 */

export interface RuleEngineResult {
  shouldCallAI: boolean
  flags: string[]
  signals: {
    needsDepth?: boolean
    inactivityDetected?: boolean
    consistencyDetected?: boolean
    qualityThreshold?: boolean
  }
  metadata: Record<string, any>
}

export interface IdeaEvaluationInput {
  problemStatement: string
  approach: string
  wordCount?: number
}

export interface ActivityEvaluationInput {
  lastActivityDate?: Date
  submissionCountLast7Days: number
  submissionCountLast30Days: number
}

export interface CodingEvaluationInput {
  explanation?: string
  timeTaken?: number
  codeLength: number
}

/**
 * Evaluate idea submission quality
 */
export function evaluateIdea(input: IdeaEvaluationInput): RuleEngineResult {
  const problemWords = input.problemStatement?.split(/\s+/).length || 0
  const approachWords = input.approach?.split(/\s+/).length || 0
  const totalWords = input.wordCount || (problemWords + approachWords)

  const flags: string[] = []
  const signals: RuleEngineResult['signals'] = {}
  let shouldCallAI = false

  // Rule: Idea too short → flag "needs depth"
  if (totalWords < 150) {
    flags.push('needs_depth')
    signals.needsDepth = true
    shouldCallAI = false // Skip AI if too short
  } else if (totalWords < 300) {
    flags.push('could_be_deeper')
    signals.needsDepth = true
    shouldCallAI = true // Call AI for guidance
  } else {
    signals.qualityThreshold = true
    shouldCallAI = true // Call AI for reflection
  }

  // Rule: Check structure completeness
  if (!input.problemStatement || input.problemStatement.trim().length < 50) {
    flags.push('missing_problem_statement')
  }

  if (!input.approach || input.approach.trim().length < 50) {
    flags.push('missing_approach')
  }

  return {
    shouldCallAI,
    flags,
    signals,
    metadata: {
      wordCount: totalWords,
      problemWordCount: problemWords,
      approachWordCount: approachWords,
    },
  }
}

/**
 * Evaluate activity patterns
 */
export function evaluateActivity(input: ActivityEvaluationInput): RuleEngineResult {
  const flags: string[] = []
  const signals: RuleEngineResult['signals'] = {}
  let shouldCallAI = false

  // Rule: No activity for 7 days → inactivity signal
  if (input.lastActivityDate) {
    const daysSinceLastActivity = Math.floor(
      (Date.now() - input.lastActivityDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (daysSinceLastActivity >= 7) {
      flags.push('inactivity_detected')
      signals.inactivityDetected = true
    }
  }

  // Rule: Daily submissions → consistency signal
  if (input.submissionCountLast7Days >= 5) {
    flags.push('consistency_detected')
    signals.consistencyDetected = true
    shouldCallAI = true // Good time for weekly reflection
  }

  // Rule: Low activity → flag
  if (input.submissionCountLast30Days < 3) {
    flags.push('low_activity')
  }

  return {
    shouldCallAI,
    flags,
    signals,
    metadata: {
      submissionCountLast7Days: input.submissionCountLast7Days,
      submissionCountLast30Days: input.submissionCountLast30Days,
    },
  }
}

/**
 * Evaluate coding submission
 */
export function evaluateCoding(input: CodingEvaluationInput): RuleEngineResult {
  const flags: string[] = []
  const signals: RuleEngineResult['signals'] = {}
  let shouldCallAI = false

  // Rule: Missing explanation → flag
  if (!input.explanation || input.explanation.trim().length < 20) {
    flags.push('missing_explanation')
  } else {
    shouldCallAI = true // Has explanation, can provide feedback
  }

  // Rule: Code too short might indicate incomplete attempt
  if (input.codeLength < 50) {
    flags.push('code_too_short')
  }

  // Rule: Time taken can indicate complexity
  if (input.timeTaken && input.timeTaken > 3600) {
    flags.push('long_time_taken') // Over 1 hour
  }

  return {
    shouldCallAI,
    flags,
    signals,
    metadata: {
      hasExplanation: !!input.explanation,
      explanationLength: input.explanation?.length || 0,
      codeLength: input.codeLength,
      timeTaken: input.timeTaken,
    },
  }
}

/**
 * Check if weekly reflection should be triggered
 */
export function shouldTriggerWeeklyReflection(
  lastWeeklyInsightDate: Date | null,
  activityCountLast7Days: number
): boolean {
  // If never generated, generate if there's activity
  if (!lastWeeklyInsightDate) {
    return activityCountLast7Days > 0
  }

  // If last generated more than 7 days ago and there's activity
  const daysSinceLastInsight = Math.floor(
    (Date.now() - lastWeeklyInsightDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  return daysSinceLastInsight >= 7 && activityCountLast7Days > 0
}
