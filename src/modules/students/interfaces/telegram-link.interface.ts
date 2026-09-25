/** One parent chat linked to a student (GET /telegram/students/{id}/link). */
export interface TelegramParent {
  id: number
  firstName?: string | null
  lastName?: string | null
  username?: string | null
  isActive: boolean
  linkedAt?: string | null
  unlinkedAt?: string | null
  /** Set when the parent blocked the bot — why the messages stopped. */
  blockedAt?: string | null
  lastNotifiedAt?: string | null
}

/**
 * GET /telegram/students/{studentId}/link. When the organization has not
 * entered a bot token yet, `botConfigured` is false and there is no QR to show.
 */
export interface TelegramStudentLink {
  studentId: number
  botUsername?: string | null
  botConfigured: boolean
  deepLink?: string | null
  /** `data:image/png;base64,…` — downloadable as-is. */
  qrDataUrl?: string | null
  parents: TelegramParent[]
}
