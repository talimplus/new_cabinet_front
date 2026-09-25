import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AttendancePicker from '../AttendancePicker.vue'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

// Deterministic stub for the real select (mirrors DashboardFilters.spec style).
const UiSelectStub = {
  name: 'UiSelect',
  props: ['modelValue', 'options', 'searchable', 'clearable'],
  emits: ['update:modelValue'],
  template: '<div class="ui-select-stub"></div>',
}

function mountPicker(props: Record<string, unknown> = {}) {
  return mount(AttendancePicker, {
    props: { month: 9, year: 2026, ...props },
    global: { stubs: { UiSelect: UiSelectStub } },
  })
}

describe('AttendancePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-09-24T00:00:00'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders 12 month options', () => {
    const wrapper = mountPicker()
    const monthSelect = wrapper.findAllComponents({ name: 'UiSelect' })[0]!
    expect(monthSelect.props('options')).toHaveLength(12)
  })

  it('renders 4 year options: the current year and 3 back', () => {
    const wrapper = mountPicker()
    const yearSelect = wrapper.findAllComponents({ name: 'UiSelect' })[1]!
    const values = (yearSelect.props('options') as Array<{ value: number }>).map((o) => o.value)
    expect(values).toEqual([2026, 2025, 2024, 2023])
  })

  it('emits update:month when the month select changes', async () => {
    const wrapper = mountPicker()
    wrapper.findAllComponents({ name: 'UiSelect' })[0]!.vm.$emit('update:modelValue', 2)
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:month') ?? [])).toEqual([2])
  })

  it('emits update:year when the year select changes', async () => {
    const wrapper = mountPicker()
    wrapper.findAllComponents({ name: 'UiSelect' })[1]!.vm.$emit('update:modelValue', 2024)
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:year') ?? [])).toEqual([2024])
  })

  it('emits current when the "current month" button is clicked', async () => {
    const wrapper = mountPicker()
    await wrapper.get('button').trigger('click')
    expect(wrapper.emitted('current')).toHaveLength(1)
  })
})
