import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentTimelineFilters from '../StudentTimelineFilters.vue'
import {
  StudentTimelineCategory as Cat,
  TIMELINE_CATEGORY_LABEL_KEYS,
} from '../../../enums/student-timeline.enum'
import { t } from '@/locales'

const mountFilters = (
  counts: Partial<Record<Cat, number>>,
  modelValue: Cat | null = null,
) => mount(StudentTimelineFilters, { props: { modelValue, counts } })

describe('StudentTimelineFilters', () => {
  it('shows the "all" chip with the total plus chips for non-empty categories only', () => {
    const w = mountFilters({ [Cat.PAYMENTS]: 3, [Cat.GROUPS]: 2, [Cat.STATUS]: 0 })
    const tabs = w.findAll('[role="tab"]')
    expect(tabs).toHaveLength(3)
    expect(tabs[0]!.text()).toContain(t('students.timeline.filters.all'))
    expect(tabs[0]!.text()).toContain('5')
    expect(tabs[1]!.text()).toContain(t(TIMELINE_CATEGORY_LABEL_KEYS[Cat.PAYMENTS]))
    expect(tabs[1]!.text()).toContain('3')
    expect(tabs[2]!.text()).toContain(t(TIMELINE_CATEGORY_LABEL_KEYS[Cat.GROUPS]))
    expect(w.text()).not.toContain(t(TIMELINE_CATEGORY_LABEL_KEYS[Cat.STATUS]))
  })

  it('emits the category when a chip is clicked', async () => {
    const w = mountFilters({ [Cat.PAYMENTS]: 1, [Cat.ATTENDANCE]: 1 })
    await w.findAll('[role="tab"]')[2]!.trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[Cat.ATTENDANCE]])
  })

  it('emits null when "all" is clicked', async () => {
    const w = mountFilters({ [Cat.PAYMENTS]: 1 }, Cat.PAYMENTS)
    await w.findAll('[role="tab"]')[0]!.trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[null]])
  })

  it('marks the selected chip with aria-selected', () => {
    const w = mountFilters({ [Cat.PAYMENTS]: 1, [Cat.GROUPS]: 1 }, Cat.GROUPS)
    expect(w.findAll('[role="tab"]').map((b) => b.attributes('aria-selected'))).toEqual([
      'false', 'false', 'true',
    ])
    const all = mountFilters({ [Cat.PAYMENTS]: 1 }, null)
    expect(all.findAll('[role="tab"]')[0]!.attributes('aria-selected')).toBe('true')
  })

  it('shows only the "all" chip with 0 when there are no events', () => {
    const w = mountFilters({})
    expect(w.findAll('[role="tab"]')).toHaveLength(1)
    expect(w.text()).toContain('0')
  })
})
