import { http } from '@/shared/api/http'
import type {
  TelegramSettings,
  TelegramSettingsForm,
  TelegramBotTokenForm,
  DebtRemindersResult,
} from '../interfaces/telegram-settings.interface'

/** GET /telegram/settings — requires `telegram.settings`. */
export async function fetchTelegramSettings(): Promise<TelegramSettings> {
  const { data } = await http.get<TelegramSettings>('/telegram/settings')
  return data
}

/** PUT /telegram/settings — save the notification switches. */
export async function updateTelegramSettings(
  form: TelegramSettingsForm,
): Promise<TelegramSettings> {
  const { data } = await http.put<TelegramSettings>('/telegram/settings', form)
  return data
}

/**
 * PUT /telegram/bot-token — validate & store the bot token; the backend calls
 * getMe() to derive the username. `skipGlobalError` so an invalid token surfaces
 * under the field instead of as a global toast (docs/03 §5.4, old app parity).
 */
export async function setTelegramBotToken(botToken: string): Promise<TelegramSettings> {
  const body: TelegramBotTokenForm = { botToken }
  const { data } = await http.put<TelegramSettings>('/telegram/bot-token', body, {
    skipGlobalError: true,
  })
  return data
}

/** DELETE /telegram/bot-token — disconnect the bot. */
export async function removeTelegramBotToken(): Promise<TelegramSettings> {
  const { data } = await http.delete<TelegramSettings>('/telegram/bot-token')
  return data
}

/** POST /telegram/debt-reminders/send-now — fire debt reminders immediately. */
export async function sendTelegramDebtReminders(): Promise<DebtRemindersResult> {
  const { data } = await http.post<DebtRemindersResult>('/telegram/debt-reminders/send-now')
  return data
}
