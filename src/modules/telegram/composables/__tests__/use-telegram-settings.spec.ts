import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTelegramSettings } from '../use-telegram-settings'
import {
  fetchTelegramSettings,
  updateTelegramSettings,
  setTelegramBotToken,
  removeTelegramBotToken,
  sendTelegramDebtReminders,
} from '../../api/telegram-settings.api'
import { useNotificationStore } from '@/stores/notification.store'
import type { TelegramSettings } from '../../interfaces/telegram-settings.interface'

vi.mock('../../api/telegram-settings.api', () => ({
  fetchTelegramSettings: vi.fn(),
  updateTelegramSettings: vi.fn(),
  setTelegramBotToken: vi.fn(),
  removeTelegramBotToken: vi.fn(),
  sendTelegramDebtReminders: vi.fn(),
}))

vi.mock('@/stores/notification.store', () => ({
  useNotificationStore: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchTelegramSettings)
const mockedUpdate = vi.mocked(updateTelegramSettings)
const mockedSetToken = vi.mocked(setTelegramBotToken)
const mockedRemoveToken = vi.mocked(removeTelegramBotToken)
const mockedSendReminders = vi.mocked(sendTelegramDebtReminders)
const mockedUseNotificationStore = vi.mocked(useNotificationStore)

function makeSettings(overrides: Partial<TelegramSettings> = {}): TelegramSettings {
  return {
    id: 1,
    organizationId: 7,
    isEnabled: true,
    notifyPaymentReceived: true,
    notifyPaymentConfirmed: false,
    notifyAbsence: false,
    notifyDebt: false,
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

describe('useTelegramSettings', () => {
  let notify: { success: ReturnType<typeof vi.fn>; error: ReturnType<typeof vi.fn>; warning: ReturnType<typeof vi.fn>; info: ReturnType<typeof vi.fn> }

  beforeEach(() => {
    vi.clearAllMocks()
    notify = { success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn() }
    // @ts-expect-error partial store mock is fine for this composable's needs
    mockedUseNotificationStore.mockReturnValue(notify)
  })

  describe('load()', () => {
    it('sets settings and copies fields into form', async () => {
      const settings = makeSettings({ notifyDebt: true, debtReminderDay: 20 })
      mockedFetch.mockResolvedValueOnce(settings)
      const ts = useTelegramSettings()

      await ts.load()

      expect(ts.settings.value).toEqual(settings)
      expect(ts.form.isEnabled).toBe(settings.isEnabled)
      expect(ts.form.notifyPaymentReceived).toBe(settings.notifyPaymentReceived)
      expect(ts.form.notifyPaymentConfirmed).toBe(settings.notifyPaymentConfirmed)
      expect(ts.form.notifyAbsence).toBe(settings.notifyAbsence)
      expect(ts.form.notifyDebt).toBe(settings.notifyDebt)
      expect(ts.form.debtReminderDay).toBe(settings.debtReminderDay)
    })
  })

  describe('dayError', () => {
    it('is empty when notifyDebt is false, regardless of the day value', () => {
      const ts = useTelegramSettings()
      ts.form.notifyDebt = false
      ts.form.debtReminderDay = 0
      expect(ts.dayError.value).toBe('')
      ts.form.debtReminderDay = 29
      expect(ts.dayError.value).toBe('')
    })

    it('is non-empty for day 0, 29, or a non-integer when notifyDebt is true', () => {
      const ts = useTelegramSettings()
      ts.form.notifyDebt = true

      ts.form.debtReminderDay = 0
      expect(ts.dayError.value).not.toBe('')

      ts.form.debtReminderDay = 29
      expect(ts.dayError.value).not.toBe('')

      ts.form.debtReminderDay = 10.5
      expect(ts.dayError.value).not.toBe('')
    })

    it('is empty for a valid day (10) when notifyDebt is true', () => {
      const ts = useTelegramSettings()
      ts.form.notifyDebt = true
      ts.form.debtReminderDay = 10
      expect(ts.dayError.value).toBe('')
    })
  })

  describe('save()', () => {
    it('does not call updateTelegramSettings when dayError is set', async () => {
      const ts = useTelegramSettings()
      ts.form.notifyDebt = true
      ts.form.debtReminderDay = 29

      await ts.save()

      expect(mockedUpdate).not.toHaveBeenCalled()
      expect(notify.success).not.toHaveBeenCalled()
    })

    it('calls updateTelegramSettings with the form and shows a success toast when valid', async () => {
      const ts = useTelegramSettings()
      ts.form.notifyDebt = true
      ts.form.debtReminderDay = 12
      const saved = makeSettings({ notifyDebt: true, debtReminderDay: 12 })
      mockedUpdate.mockResolvedValueOnce(saved)

      await ts.save()

      expect(mockedUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ notifyDebt: true, debtReminderDay: 12 }),
      )
      expect(notify.success).toHaveBeenCalledTimes(1)
      expect(ts.settings.value).toEqual(saved)
    })
  })

  describe('saveToken()', () => {
    it('trims the input and is a no-op when empty', async () => {
      const ts = useTelegramSettings()
      ts.tokenInput.value = '   '

      await ts.saveToken()

      expect(mockedSetToken).not.toHaveBeenCalled()
    })

    it('on success calls setTelegramBotToken, clears tokenInput, and closes the change form', async () => {
      const ts = useTelegramSettings()
      ts.tokenInput.value = '  123:ABC  '
      ts.changingToken.value = true
      const updated = makeSettings({ botTokenMasked: '123:****ABC' })
      mockedSetToken.mockResolvedValueOnce(updated)

      await ts.saveToken()

      expect(mockedSetToken).toHaveBeenCalledWith('123:ABC')
      expect(ts.tokenInput.value).toBe('')
      expect(ts.changingToken.value).toBe(false)
      expect(notify.success).toHaveBeenCalledTimes(1)
      expect(ts.settings.value).toEqual(updated)
    })

    it('on rejection sets tokenError and does not rethrow', async () => {
      const ts = useTelegramSettings()
      ts.tokenInput.value = 'bad-token'
      mockedSetToken.mockRejectedValueOnce({ response: { data: { message: 'bad token' } } })

      await expect(ts.saveToken()).resolves.toBeUndefined()

      expect(ts.tokenError.value).toBe('bad token')
      expect(notify.success).not.toHaveBeenCalled()
    })
  })

  describe('removeToken()', () => {
    it('calls removeTelegramBotToken and applies the result to the form', async () => {
      const ts = useTelegramSettings()
      const cleared = makeSettings({ botConfigured: false, botConnected: false, botUsername: null })
      mockedRemoveToken.mockResolvedValueOnce(cleared)

      await ts.removeToken()

      expect(mockedRemoveToken).toHaveBeenCalled()
      expect(ts.settings.value).toEqual(cleared)
      expect(notify.success).toHaveBeenCalledTimes(1)
    })
  })

  describe('sendReminders()', () => {
    it('calls sendTelegramDebtReminders and notifies with the returned count', async () => {
      mockedSendReminders.mockResolvedValueOnce({ students: 7 })
      const ts = useTelegramSettings()

      await ts.sendReminders()

      expect(mockedSendReminders).toHaveBeenCalled()
      expect(notify.success).toHaveBeenCalledTimes(1)
    })
  })
})
