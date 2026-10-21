import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TimelineChildren from '../TimelineChildren.vue'
import { TimelineTone } from '@/shared/enums/timeline-tone.enum'
import { Users } from '@/shared/icons'
import { t } from '@/locales'
import type { TimelineEntryView } from '@/shared/interfaces/timeline-entry.interface'

const child = (id: string, over: Partial<TimelineEntryView> = {}): TimelineEntryView => ({
  id, icon: Users, tone: TimelineTone.SUCCESS, title: `Title ${id}`, lines: [], note: null,
  amount: null, badge: null, time: null, actor: null, group: null, ...over,
})
const RouterLink = { props: ['to'], template: '<a class="rl"><slot /></a>' }
const mountIt = (entries: TimelineEntryView[]) =>
  mount(TimelineChildren, { props: { entries }, global: { stubs: { RouterLink } } })

describe('TimelineChildren', () => {
  it('is collapsed by default', () => {
    const w = mountIt([child('1'), child('2')])
    expect(w.get('button').attributes('aria-expanded')).toBe('false')
    expect(w.find('ul').exists()).toBe(false)
    expect(w.get('button').text()).toContain(t('common.timeline.expand', { count: 2 }))
  })

  it('toggles open and closed', async () => {
    const w = mountIt([child('1', { subject: { text: 'Ali', to: null } }), child('2', { title: 'Plain' })])
    await w.get('button').trigger('click')
    expect(w.get('button').attributes('aria-expanded')).toBe('true')
    expect(w.get('button').text()).toContain(t('common.timeline.collapse', { count: 2 }))
    const items = w.findAll('li')
    expect(items).toHaveLength(2)
    expect(items[0]!.text()).toContain('Ali')
    expect(items[1]!.text()).toContain('Plain')
    await w.get('button').trigger('click')
    expect(w.find('ul').exists()).toBe(false)
  })

  it('renders subject links, group, lines and note of a child', async () => {
    const w = mountIt([child('1', {
      subject: { text: 'Ali', to: { name: 'student-card', params: { id: 1 } } },
      group: { text: 'B-2', to: null },
      lines: ['line one'],
      note: 'sabab',
    })])
    await w.get('button').trigger('click')
    expect(w.get('a.rl').text()).toBe('Ali')
    const text = w.get('li').text()
    expect(text).toContain('B-2')
    expect(text).toContain('line one')
    expect(text).toContain('sabab')
  })
})
