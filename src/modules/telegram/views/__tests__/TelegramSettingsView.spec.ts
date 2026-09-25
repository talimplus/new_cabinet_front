import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const { load } = vi.hoisted(() => ({ load: vi.fn() }))

vi.mock('../../composables/use-telegram-settings', async () => {
  const { ref, reactive } = await import('vue')
  return {
    useTelegramSettings: () => ({
      settings: ref({
        id: 1,
        organizationId: 2,
        isEnabled: true,
        notifyPaymentReceived: true,
        notifyPaymentConfirmed: false,
        notifyAbsence: false,
        notifyDebt: false,
        debtReminderDay: 10,
        botConfigured: false,
        botConnected: false,
        botUsername: null,
        botTokenMasked: null,
        botTokenUpdatedAt: null,
        createdAt: '2026-09-21T12:10:57.257Z',
        updatedAt: '2026-09-21T12:10:57.257Z',
      }),
      loading: ref(false),
      saving: ref(false),
      savingToken: ref(false),
      removingToken: ref(false),
      sendingReminders: ref(false),
      tokenInput: ref(''),
      tokenError: ref(''),
      changingToken: ref(false),
      form: reactive({
        isEnabled: true,
        notifyPaymentReceived: true,
        notifyPaymentConfirmed: false,
        notifyAbsence: false,
        notifyDebt: false,
        debtReminderDay: 10,
      }),
      dayError: ref(''),
      load,
      save: vi.fn(),
      saveToken: vi.fn(),
      cancelTokenChange: vi.fn(),
      removeToken: vi.fn(),
      sendReminders: vi.fn(),
    }),
  }
})

import TelegramSettingsView from '../TelegramSettingsView.vue'
import { t } from '@/locales'

describe('TelegramSettingsView', () => {
  it('loads settings on mount and renders the three sections', async () => {
    const wrapper = mount(TelegramSettingsView)
    await flushPromises()

    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain(t('telegram.settings.botTitle'))
    expect(wrapper.text()).toContain(t('telegram.settings.notificationsTitle'))
    expect(wrapper.text()).toContain(t('telegram.settings.howTitle'))
  })
})
