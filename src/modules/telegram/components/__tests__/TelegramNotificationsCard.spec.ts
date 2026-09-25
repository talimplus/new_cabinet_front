import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TelegramNotificationsCard from '../TelegramNotificationsCard.vue'
import { t } from '@/locales'

function mountCard(over: Record<string, unknown> = {}) {
  return mount(TelegramNotificationsCard, {
    props: {
      isEnabled: true,
      notifyPaymentReceived: false,
      notifyPaymentConfirmed: false,
      notifyAbsence: false,
      notifyDebt: false,
      debtReminderDay: 10,
      dayError: '',
      saving: false,
      sendingReminders: false,
      ...over,
    },
  })
}

const saveBtn = (w: ReturnType<typeof mountCard>) =>
  w.findAll('button').find((b) => b.text().includes(t('common.save')))!
const sendBtn = (w: ReturnType<typeof mountCard>) =>
  w.findAll('button').find((b) => b.text().includes(t('telegram.settings.sendNow')))

describe('TelegramNotificationsCard', () => {
  it('disables the child toggles when the master switch is off', () => {
    const wrapper = mountCard({ isEnabled: false })
    const boxes = wrapper.findAll('input[type=checkbox]')
    expect(boxes).toHaveLength(5)
    expect(boxes[0]!.attributes('disabled')).toBeUndefined() // master toggle stays on
    for (const box of boxes.slice(1)) expect(box.attributes('disabled')).toBeDefined()
  })

  it('shows the debt-reminder day field only when the debt switch is on', async () => {
    const off = mountCard({ notifyDebt: false })
    expect(off.find('input[type=number]').exists()).toBe(false)

    const on = mountCard({ notifyDebt: true })
    expect(on.find('input[type=number]').exists()).toBe(true)
  })

  it('disables Save when there is a day error', () => {
    const wrapper = mountCard({ notifyDebt: true, dayError: t('telegram.settings.dayError') })
    expect(saveBtn(wrapper).attributes('disabled')).toBeDefined()
  })

  it('emits "save" when Save is clicked', async () => {
    const wrapper = mountCard()
    await saveBtn(wrapper).trigger('click')
    expect(wrapper.emitted('save')).toHaveLength(1)
  })

  it('shows "send now" only when debt reminders are enabled, and emits "send"', async () => {
    expect(sendBtn(mountCard({ notifyDebt: false }))).toBeUndefined()
    expect(sendBtn(mountCard({ notifyDebt: true, isEnabled: false }))).toBeUndefined()

    const wrapper = mountCard({ notifyDebt: true, isEnabled: true })
    await sendBtn(wrapper)!.trigger('click')
    expect(wrapper.emitted('send')).toHaveLength(1)
  })

  it('emits update:isEnabled when the master toggle is changed', async () => {
    const wrapper = mountCard({ isEnabled: true })
    await wrapper.findAll('input[type=checkbox]')[0]!.setValue(false)
    const events = wrapper.emitted('update:isEnabled') ?? []
    expect(events[events.length - 1]).toEqual([false])
  })
})
