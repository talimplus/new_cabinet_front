import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardFilters from '../DashboardFilters.vue'

function mountFilters(props: Partial<Record<string, unknown>> = {}) {
  return mount(DashboardFilters, {
    props: { fromMonth: '2026-01', toMonth: '2026-09', ...props },
  })
}

describe('DashboardFilters', () => {
  it('renders both month inputs with the given values', () => {
    const months = mountFilters().findAll('input[type="month"]')
    expect(months).toHaveLength(2)
    expect((months[0]!.element as HTMLInputElement).value).toBe('2026-01')
    expect((months[1]!.element as HTMLInputElement).value).toBe('2026-09')
  })

  it('emits update:from when the first month input changes', async () => {
    const wrapper = mountFilters()
    await wrapper.findAll('input[type="month"]')[0]!.setValue('2026-03')
    const events = wrapper.emitted('update:from') ?? []
    expect(events[events.length - 1]).toEqual(['2026-03'])
    expect(wrapper.emitted('update:to')).toBeUndefined()
  })

  it('emits update:to when the second month input changes', async () => {
    const wrapper = mountFilters()
    await wrapper.findAll('input[type="month"]')[1]!.setValue('2026-12')
    const events = wrapper.emitted('update:to') ?? []
    expect(events[events.length - 1]).toEqual(['2026-12'])
    expect(wrapper.emitted('update:from')).toBeUndefined()
  })

  it('no longer offers a center picker — the header owns the center scope', () => {
    expect(mountFilters().findComponent({ name: 'UiSelect' }).exists()).toBe(false)
  })
})
