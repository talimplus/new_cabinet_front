import type { ChatRole } from '../enums/chat-role.enum'

/** One message in the AI plan-builder conversation. */
export interface AiChatMessage {
  role: ChatRole
  content: string
}
