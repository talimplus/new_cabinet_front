import type { AiResponseType } from '../enums/ai-response-type.enum'
import type { AiChatMessage } from './ai-chat-message.interface'
import type { AiPlan, AiPlanTopic } from './ai-plan.interface'

// Re-export the canonical AI shapes so consumers can pull everything from here.
export type { AiChatMessage } from './ai-chat-message.interface'
export type { AiPlan, AiPlanTopic } from './ai-plan.interface'

/** Body for `POST /syllabuses/ai/chat`. */
export interface AiChatPayload {
  subjectId?: number
  messages: AiChatMessage[]
}

/**
 * Response from `POST /syllabuses/ai/chat`. Modeled as ONE interface (not a
 * discriminated union `type`): `plan` is present only when `type === PLAN`.
 */
export interface AiChatResponse {
  type: AiResponseType
  message: string
  plan?: AiPlan
}

/** Body for `POST /syllabuses/ai/save`. */
export interface AiSavePayload {
  subjectId: number
  name: string
  description?: string
  topics: AiPlanTopic[]
}
