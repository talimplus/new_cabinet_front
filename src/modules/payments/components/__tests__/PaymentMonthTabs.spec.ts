import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentMonthTabs from '../PaymentMonthTabs.vue'
import { t } from '@/locales'

function mountTabs(props: { modelValue: string; year: number }) {
  return mount(PaymentMonthTabs, { props })
}

describe('PaymentMonthTabs', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('stops at the current month when the selected year is the current year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))

    const wrapper = mountTabs({ modelValue: '09', year: 2026 })
    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(9)
    expect(wrapper.text()).toContain(t('common.monthsShort.09'))
    expect(wrapper.text()).not.toContain(t('common.monthsShort.10'))
  })

  it('shows all 12 months for a past (or otherwise non-current) year', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))

    const wrapper = mountTabs({ modelValue: '01', year: 2025 })
    expect(wrapper.findAll('button')).toHaveLength(12)
    expect(wrapper.text()).toContain(t('common.monthsShort.12'))
  })

  it('gives the selected month the primary token class', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))

    const wrapper = mountTabs({ modelValue: '05', year: 2026 })
    const selected = wrapper.findAll('button').find((b) => b.text() === t('common.monthsShort.05'))!
    expect(selected.classes().join(' ')).toContain('bg-primary')
  })

  it('dims months before the current month', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))

    const wrapper = mountTabs({ modelValue: '09', year: 2026 })
    const past = wrapper.findAll('button').find((b) => b.text() === t('common.monthsShort.03'))!
    const current = wrapper.findAll('button').find((b) => b.text() === t('common.monthsShort.09'))!
    expect(past.classes().join(' ')).toContain('text-fg-subtle')
    expect(current.classes().join(' ')).not.toContain('text-fg-subtle')
  })

  it('emits change with the MM value when a tab is clicked', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))

    const wrapper = mountTabs({ modelValue: '09', year: 2026 })
    const target = wrapper.findAll('button').find((b) => b.text() === t('common.monthsShort.03'))!
    await target.trigger('click')
    expect(wrapper.emitted('change')?.[0]).toEqual(['03'])
  })
})
