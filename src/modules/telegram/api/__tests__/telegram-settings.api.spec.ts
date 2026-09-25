import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchTelegramSettings,
  updateTelegramSettings,
  setTelegramBotToken,
  removeTelegramBotToken,
  sendTelegramDebtReminders,
} from '../telegram-settings.api'
import { http } from '@/shared/api/http'
import type {
  TelegramSettings,
  TelegramSettingsForm,
} from '../../interfaces/telegram-settings.interface'

// Mock the shared axios instance — API tests never hit the network.
vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makeSettings(overrides: Partial<TelegramSettings> = {}): TelegramSettings {
  return {
    id: 1,
    organizationId: 7,
    isEnabled: true,
    notifyPaymentReceived: true,
    notifyPaymentConfirmed: false,
    notifyAbsence: false,
    notifyDebt: true,
    debtReminderDay: 10,
    botConfigured: true,
    botConnected: true,
    botUsername: 'talimplus_bot',
    botTokenMasked: '123456:****ABCD',
    botTokenUpdatedAt: '2026-09-24T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-09-24T00:00:00.000Z',
    ...overrides,
  }
}

describe('telegram-settings.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchTelegramSettings gets /telegram/settings and returns response.data', async () => {
    const body = makeSettings()
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchTelegramSettings()

    expect(mockedHttp.get).toHaveBeenCalledWith('/telegram/settings')
    expect(result).toEqual(body)
  })

  it('updateTelegramSettings puts the form body and returns response.data', async () => {
    const form: TelegramSettingsForm = {
      isEnabled: true,
      notifyPaymentReceived: true,
      notifyPaymentConfirmed: true,
      notifyAbsence: false,
      notifyDebt: true,
      debtReminderDay: 15,
    }
    const body = makeSettings({ debtReminderDay: 15 })
    mockedHttp.put.mockResolvedValueOnce({ data: body })

    const result = await updateTelegramSettings(form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/telegram/settings', form)
    expect(result).toEqual(body)
  })

  it('setTelegramBotToken puts the token body with skipGlobalError and returns response.data', async () => {
    const body = makeSettings({ botTokenMasked: '123:****ABC' })
    mockedHttp.put.mockResolvedValueOnce({ data: body })

    const result = await setTelegramBotToken('123:ABC')

    expect(mockedHttp.put).toHaveBeenCalledWith(
      '/telegram/bot-token',
      { botToken: '123:ABC' },
      expect.objectContaining({ skipGlobalError: true }),
    )
    expect(result).toEqual(body)
  })

  it('removeTelegramBotToken deletes /telegram/bot-token and returns response.data', async () => {
    const body = makeSettings({ botConfigured: false, botConnected: false, botUsername: null })
    mockedHttp.delete.mockResolvedValueOnce({ data: body })

    const result = await removeTelegramBotToken()

    expect(mockedHttp.delete).toHaveBeenCalledWith('/telegram/bot-token')
    expect(result).toEqual(body)
  })

  it('sendTelegramDebtReminders posts to send-now and returns { students }', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: { students: 5 } })

    const result = await sendTelegramDebtReminders()

    expect(mockedHttp.post).toHaveBeenCalledWith('/telegram/debt-reminders/send-now')
    expect(result).toEqual({ students: 5 })
  })
})
