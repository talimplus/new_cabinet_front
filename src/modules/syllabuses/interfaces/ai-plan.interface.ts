import type { TopicDifficulty } from '../enums/topic-difficulty.enum'

/** A topic inside an AI-proposed plan. */
export interface AiPlanTopic {
  title: string
  description?: string | null
  difficulty: TopicDifficulty
  estimatedLessons: number
}

/** An AI-proposed syllabus plan (returned when the assistant is ready). */
export interface AiPlan {
  name: string
  description?: string | null
  totalLessons?: number | null
  topics: AiPlanTopic[]
}
