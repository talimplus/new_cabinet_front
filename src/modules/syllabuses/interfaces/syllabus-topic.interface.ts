import type { TopicDifficulty } from '../enums/topic-difficulty.enum'

/** A single topic inside a syllabus (server object). */
export interface SyllabusTopic {
  id: number
  orderIndex: number
  title: string
  description: string | null
  difficulty: TopicDifficulty | null
  estimatedLessons: number | null
  guide: string | null
  lessonOutline: string | null
  homework: string | null
}
