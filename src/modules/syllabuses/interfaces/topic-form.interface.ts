import type { TopicDifficulty } from '../enums/topic-difficulty.enum'

/** Create/update body for a syllabus topic (all fields optional on update). */
export interface TopicForm {
  title?: string
  description?: string
  difficulty?: TopicDifficulty
  estimatedLessons?: number
  guide?: string
  lessonOutline?: string
  homework?: string
}
