// Re-export so the payload + result can be pulled from one place.
export type { GenerateContentPayload } from './generate-content-payload.interface'

/** AI-generated teaching content for a single topic. */
export interface GeneratedTopicContent {
  guide: string | null
  lessonOutline: string | null
  homework: string | null
}
