import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineFilterChips from '../TimelineFilterChips.vue'

const options = [
  { key: 'all', value: null, label: 'All', count: 5 },
  { key: 'a', value: 'a', label: 'Alpha', count: 2 },
]

describe('TimelineFilterChips', () => {
  it('renders a tab per option with label and count', () => {
    const tabs = mount(TimelineFilterChips, { props: { modelValue: null, options } }).findAll('[role="tab"]')
    expect(tabs).toHaveLength(2)
    expect(tabs[1]!.text()).toContain('Alpha')
    expect(tabs[1]!.text()).toContain('2')
  })

  it('marks the selected option, including null for all', () => {
    const w = mount(TimelineFilterChips, { props: { modelValue: null, options } })
    const tabs = w.findAll('[role="tab"]')
    expect(tabs[0]!.attributes('aria-selected')).toBe('true')
    expect(tabs[0]!.classes().join(' ')).toContain('bg-primary')
    expect(tabs[1]!.attributes('aria-selected')).toBe('false')
  })

  it('emits the option value on click', async () => {
    const w = mount(TimelineFilterChips, { props: { modelValue: null, options } })
    const tabs = w.findAll('[role="tab"]')
    await tabs[1]!.trigger('click')
    await tabs[0]!.trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([['a'], [null]])
  })
})
