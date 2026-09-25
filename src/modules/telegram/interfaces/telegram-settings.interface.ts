/**
 * Organization-wide Telegram bot settings (GET/PUT /telegram/settings).
 * Confirmed live 2026-09-24: the value of the bot token itself is never
 * returned — only `botTokenMasked` and the connection flags.
 */
export interface TelegramSettings {
  id: number
  organizationId: number
  isEnabled: boolean
  notifyPaymentReceived: boolean
  notifyPaymentConfirmed: boolean
  notifyAbsence: boolean
  notifyDebt: boolean
  debtReminderDay: number
  /** The org has stored a bot token (its value is not returned). */
  botConfigured: boolean
  /** The bot is currently reachable on Telegram (token still valid). */
  botConnected: boolean
  botUsername: string | null
  botTokenMasked: string | null
  botTokenUpdatedAt: string | null
  createdAt: string
  updatedAt: string
}

/** PUT /telegram/settings body — all notification switches sent together. */
export interface TelegramSettingsForm {
  isEnabled: boolean
  notifyPaymentReceived: boolean
  notifyPaymentConfirmed: boolean
  notifyAbsence: boolean
  notifyDebt: boolean
  debtReminderDay: number
}

/** PUT /telegram/bot-token body — username is derived from getMe(), not sent. */
export interface TelegramBotTokenForm {
  botToken: string
}

/** POST /telegram/debt-reminders/send-now — how many students were notified. */
export interface DebtRemindersResult {
  students: number
}
