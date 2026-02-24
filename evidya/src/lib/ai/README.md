# EVIDYA AI System

## Architecture Overview

The AI system follows a strict philosophy: **AI is a mentor, not a solver**. The AI guides users to think better, but never thinks for them.

### Core Components

1. **Rule Engine** (`ruleEngine.ts`) - Pure logic layer (NO AI)
   - Evaluates submissions based on objective metrics
   - Decides if AI should be called
   - Flags quality issues

2. **AI Service** (`aiService.ts`) - LLM wrapper abstraction
   - Abstracts away specific LLM provider
   - Supports OpenAI and mock service for development
   - Handles API calls and error handling

3. **AI Orchestrator** (`orchestrator.ts`) - Decision layer
   - Decides which AI module to call
   - Controls cost and quality
   - Manages context

4. **Specialized Modules** (`modules.ts`)
   - Idea Guidance (pre-submission)
   - Idea Reflection (post-submission)
   - Coding Practice Feedback
   - Weekly Growth Reflection

5. **Memory System** (`memory.ts`)
   - Short-term context (recent submissions)
   - Long-term memory (growth patterns)
   - Caching for cost efficiency

6. **Safety System** (`safety.ts`)
   - Rate limiting
   - Anti-misuse detection
   - Output sanitization

## API Endpoints

### POST `/api/ai/idea-guidance`
Provides guidance on draft idea before submission.

**Request:**
```json
{
  "problemStatement": "...",
  "approach": "..."
}
```

**Response:**
```json
{
  "guidance": "• Consider adding more context...",
  "shouldProceed": true
}
```

### POST `/api/ai/idea-summary`
Generates reflective summary after idea submission.

**Request:**
```json
{
  "ideaId": "...",
  "problemStatement": "...",
  "approach": "..."
}
```

**Response:**
```json
{
  "reflection": "This submission shows early problem framing...",
  "cached": false
}
```

### POST `/api/ai/coding-feedback`
Provides feedback on coding submission approach.

**Request:**
```json
{
  "submissionId": "...",
  "explanation": "...",
  "timeTaken": 300,
  "codeLength": 150,
  "challengeTitle": "..."
}
```

**Response:**
```json
{
  "feedback": "Your explanation shows good problem-solving approach...",
  "cached": false
}
```

### POST `/api/ai/weekly-reflection`
Generates weekly growth narrative.

**Request:** None (uses authenticated user)

**Response:**
```json
{
  "reflection": "This week shows consistent practice..."
}
```

## Usage Example

```typescript
import { IdeaReflectionModule, AIOrchestrator } from '@/lib/ai'

const orchestrator = new AIOrchestrator()
const reflectionModule = new IdeaReflectionModule(orchestrator)

const reflection = await reflectionModule.generateReflection(
  userId,
  ideaId,
  problemStatement,
  approach
)
```

## Configuration

Set `OPENAI_API_KEY` in your `.env.local` file to enable real AI responses. Without it, the system uses a mock service for development.

## Safety Features

- Rate limiting (10 calls per hour per user)
- Content validation (checks for AI-generated content)
- Output sanitization
- Caching to prevent repeated calls

## Database Schema

The AI system uses these models:
- `AiInsight` - Stores AI-generated insights
- `ActivityLog` - Tracks user activity for pattern analysis

Run `npx prisma db push` to update your database schema.
