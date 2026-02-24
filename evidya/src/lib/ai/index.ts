/**
 * AI System - Main Export
 * 
 * Centralized exports for the AI system
 */

// Core components
export type { RuleEngineResult } from './ruleEngine'
export { evaluateIdea, evaluateActivity, evaluateCoding, shouldTriggerWeeklyReflection } from './ruleEngine'
export { BaseAIService, OpenAIService, MockAIService, getAIService, type AIResponse, type AIServiceConfig } from './aiService'
export { AIOrchestrator, type OrchestratorDecision, type OrchestratorContext } from './orchestrator'
export { PROMPTS, SYSTEM_PROMPTS } from './prompts'

// Specialized modules
export {
  IdeaGuidanceModule,
  IdeaReflectionModule,
  CodingFeedbackModule,
  WeeklyGrowthModule,
} from './modules'

// Memory system
export {
  getShortTermContext,
  getLongTermMemory,
  getCachedInsight,
  cacheInsight,
  type ShortTermContext,
  type LongTermMemory,
} from './memory'

// Safety
export {
  performSafetyCheck,
  checkForAIGeneratedContent,
  checkAIRateLimit,
  checkSuspiciousActivity,
  validateAIOutputIsAdvisory,
  sanitizeAIOutput,
  type SafetyCheckResult,
} from './safety'
