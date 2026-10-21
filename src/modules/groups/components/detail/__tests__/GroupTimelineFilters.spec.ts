import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupTimelineFilters from '../GroupTimelineFilters.vue'
import { GroupTimelineCategory as Cat } from '../../../enums/group-timeline.enum'
import { t } from '@/locales'

const mountIt = (counts: Partial<Record<Cat, number>>, modelValue: Cat | null = null) =>
  mount(GroupTimelineFilters, { props: { modelValue, counts } })

describe('GroupTimelineFilters', () => {
  it('shows the all chip with the total, including group events', () => {
    const tabs = mountIt({ [Cat.GROUP]: 2, [Cat.FEE]: 3 }).findAll('[role="tab"]')
    expect(tabs[0]!.text()).toContain(t('groups.timeline.filters.all'))
    expect(tabs[0]!.text()).toContain('5')
  })

  it('renders only non-empty chips in fixed order and never a group chip', () => {
    const tabs = mountIt({
      [Cat.STUDENTS]: 1, [Cat.GROUP]: 4, [Cat.TEACHER]: 2, [Cat.PAUSE]: 0, [Cat.FEE]: 1,
    }).findAll('[role="tab"]')
    const labels = tabs.map((t_) => t_.text())
    expect(labels).toHaveLength(4)
    expect(labels[1]).toContain(t('groups.timeline.filters.teacher'))
    expect(labels[2]).toContain(t('groups.timeline.filters.fee'))
    expect(labels[3]).toContain(t('groups.timeline.filters.students'))
    expect(labels.join()).not.toContain(t('groups.timeline.filters.pause'))
  })

  it('emits the category on click and null for all', async () => {
    const w = mountIt({ [Cat.TEACHER]: 1 }, Cat.TEACHER)
    const tabs = w.findAll('[role="tab"]')
    await tabs[1]!.trigger('click')
    await tabs[0]!.trigger('click')
    expect(w.emitted('update:modelValue')).toEqual([[Cat.TEACHER], [null]])
    expect(tabs[1]!.attributes('aria-selected')).toBe('true')
  })
})
