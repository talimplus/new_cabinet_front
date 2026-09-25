import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TelegramBotCard from '../TelegramBotCard.vue'
import { t } from '@/locales'
import type { TelegramSettings } from '../../interfaces/telegram-settings.interface'

function makeSettings(over: Partial<TelegramSettings> = {}): TelegramSettings {
  return {
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
    ...over,
  }
}

function mountCard(settings: TelegramSettings, extra: Record<string, unknown> = {}) {
  return mount(TelegramBotCard, {
    props: { settings, tokenError: '', savingToken: false, removingToken: false, token: '', changing: false, ...extra },
  })
}

describe('TelegramBotCard', () => {
  it('shows the connected (success) alert with the bot username', () => {
    const wrapper = mountCard(makeSettings({ botConfigured: true, botConnected: true, botUsername: 'talim_bot' }))
    const alert = wrapper.get('p')
    expect(alert.classes().join(' ')).toContain('bg-success-soft')
    expect(wrapper.text()).toContain('talim_bot')
  })

  it('shows the warning alert when the token is set but not connected', () => {
    const wrapper = mountCard(makeSettings({ botConfigured: true, botConnected: false }))
    expect(wrapper.get('p').classes().join(' ')).toContain('bg-warning-soft')
    expect(wrapper.text()).toContain(t('telegram.settings.tokenSetNotConnected'))
  })

  it('shows the info alert and the token input when no bot is configured', () => {
    const wrapper = mountCard(makeSettings())
    expect(wrapper.get('p').classes().join(' ')).toContain('bg-info-soft')
    expect(wrapper.find('input').exists()).toBe(true)
  })

  it('shows the masked token, change and disconnect buttons when configured', () => {
    const wrapper = mountCard(makeSettings({ botConfigured: true, botTokenMasked: '12****89' }))
    expect(wrapper.text()).toContain('12****89')
    expect(wrapper.text()).toContain(t('telegram.settings.changeToken'))
    expect(wrapper.text()).toContain(t('telegram.settings.disconnectBot'))
  })

  it('emits "remove" when the disconnect button is clicked', async () => {
    const wrapper = mountCard(makeSettings({ botConfigured: true, botTokenMasked: '12****89' }))
    const disconnect = wrapper.findAll('button').find((b) => b.text().includes(t('telegram.settings.disconnectBot')))!
    await disconnect.trigger('click')
    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('disables Connect while empty and mirrors typing through update:token', async () => {
    const wrapper = mountCard(makeSettings())
    const connect = wrapper.findAll('button').find((b) => b.text().includes(t('telegram.settings.connectBot')))!
    expect(connect.attributes('disabled')).toBeDefined()

    await wrapper.get('input').setValue('123:ABC')
    const events = wrapper.emitted('update:token') ?? []
    expect(events[events.length - 1]).toEqual(['123:ABC'])
  })

  it('emits "save" when Connect is clicked with a token present', async () => {
    const wrapper = mountCard(makeSettings(), { token: '123:ABC' })
    const connect = wrapper.findAll('button').find((b) => b.text().includes(t('telegram.settings.connectBot')))!
    expect(connect.attributes('disabled')).toBeUndefined()
    await connect.trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('renders the token error under the field', () => {
    const wrapper = mountCard(makeSettings(), { tokenError: 'Invalid token' })
    expect(wrapper.text()).toContain('Invalid token')
  })
})
