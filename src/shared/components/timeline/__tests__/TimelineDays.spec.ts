import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineDays from '../TimelineDays.vue'
import { TimelineTone } from '@/shared/enums/timeline-tone.enum'
import { Users } from '@/shared/icons'
import { t } from '@/locales'
import type { TimelineDay } from '@/shared/interfaces/timeline-entry.interface'

const days: TimelineDay[] = [{
  key: '2026-10-21', label: 'Bugun',
  entries: [{
    id: 'a', icon: Users, tone: TimelineTone.SUCCESS, title: 'Entry A', lines: [], note: null,
    amount: null, badge: null, time: null, actor: null, group: null,
  }],
}]

const base = {
  days, hasItems: true, loading: false, failed: false, remaining: 0,
  emptyText: 'EMPTY', emptyFilteredText: 'EMPTY FILTERED',
}
const mountIt = (over: Partial<typeof base> = {}) => mount(TimelineDays, { props: { ...base, ...over } })

describe('TimelineDays', () => {
  it('renders day labels and entries', () => {
    const w = mountIt()
    expect(w.text()).toContain('Bugun')
    expect(w.text()).toContain('Entry A')
  })

  it('shows a spinner while loading with nothing yet', () => {
    const w = mountIt({ loading: true, hasItems: false, days: [] })
    expect(w.find('ol').exists()).toBe(false)
    expect(w.text()).not.toContain('EMPTY')
    expect(w.find('.py-6').exists()).toBe(true)
  })

  it('shows the error and emits retry', async () => {
    const w = mountIt({ failed: true, days: [] })
    expect(w.text()).toContain(t('common.timeline.loadError'))
    await w.get('button').trigger('click')
    expect(w.emitted('retry')).toHaveLength(1)
  })

  it('distinguishes empty from empty-filtered', () => {
    expect(mountIt({ days: [], hasItems: false }).text()).toBe('EMPTY')
    expect(mountIt({ days: [], hasItems: true }).text()).toBe('EMPTY FILTERED')
  })

  it('shows "show more" only with remaining items and emits showMore', async () => {
    expect(mountIt().find('button').exists()).toBe(false)
    const w = mountIt({ remaining: 7 })
    expect(w.get('button').text()).toBe(t('common.timeline.showMore', { count: 7 }))
    await w.get('button').trigger('click')
    expect(w.emitted('showMore')).toHaveLength(1)
  })
})
