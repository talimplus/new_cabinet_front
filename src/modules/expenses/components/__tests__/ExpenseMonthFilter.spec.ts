import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpenseMonthFilter from '../ExpenseMonthFilter.vue'
import { UiSelect, UiTabs } from '@/shared/components'

function mountFilter(modelValue: string) {
  return mount(ExpenseMonthFilter, { props: { modelValue } })
}

describe('ExpenseMonthFilter', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-15'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('offers only Jan..current month as tabs for the current year, current month unmuted', () => {
    const wrapper = mountFilter('2026-09')
    const tabs = wrapper.findComponent(UiTabs)

    expect(tabs.props('tabs')).toHaveLength(9)
    expect(tabs.props('modelValue')).toBe('09')

    const keys = (tabs.props('tabs') as Array<{ key: string; muted?: boolean }>).map((tab) => tab.key)
    expect(keys).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09'])

    const byKey = Object.fromEntries(
      (tabs.props('tabs') as Array<{ key: string; muted?: boolean }>).map((tab) => [tab.key, tab.muted]),
    )
    expect(byKey['01']).toBe(true)
    expect(byKey['08']).toBe(true)
    expect(byKey['09']).toBe(false)
  })

  it('offers all 12 months for a non-current year', () => {
    const wrapper = mountFilter('2025-03')
    const tabs = wrapper.findComponent(UiTabs)
    expect(tabs.props('tabs')).toHaveLength(12)
  })

  it('sets the year select value from the model', () => {
    const wrapper = mountFilter('2026-09')
    expect(wrapper.findComponent(UiSelect).props('modelValue')).toBe(2026)
  })

  it('offers curYear-1, curYear, curYear+1 as year choices', () => {
    const wrapper = mountFilter('2026-09')
    const options = wrapper.findComponent(UiSelect).props('options') as Array<{ value: number }>
    expect(options.map((o) => o.value)).toEqual([2025, 2026, 2027])
  })

  it('emits "<year>-<month>" when a month tab is picked', async () => {
    const wrapper = mountFilter('2026-09')
    await wrapper.findComponent(UiTabs).vm.$emit('update:modelValue', '04')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-04'])
  })

  it('emits the new year with the same month when it still fits', async () => {
    const wrapper = mountFilter('2026-09')
    await wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', 2025)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2025-09'])
  })

  it('clamps the month down to the max available month for the new year', async () => {
    const wrapper = mountFilter('2025-11')
    await wrapper.findComponent(UiSelect).vm.$emit('update:modelValue', 2026)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual(['2026-09'])
  })
})
