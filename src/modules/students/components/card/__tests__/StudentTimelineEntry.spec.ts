import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentTimelineEntry from '../StudentTimelineEntry.vue'
import { TimelineTone, TIMELINE_TONE_MARKER, TIMELINE_TONE_TEXT } from '../../../enums/timeline-tone.enum'
import { Users } from '@/shared/icons'
import type { TimelineEntryView } from '../../../interfaces/student-timeline-entry.interface'

function entry(over: Partial<TimelineEntryView> = {}): TimelineEntryView {
  return {
    id: 'e:1',
    icon: Users,
    tone: TimelineTone.SUCCESS,
    title: 'Title text',
    lines: [],
    note: null,
    amount: null,
    badge: null,
    time: null,
    actor: null,
    group: null,
    ...over,
  }
}

const mountEntry = (e: TimelineEntryView, last = false) =>
  mount(StudentTimelineEntry, { props: { entry: e, last } })

describe('StudentTimelineEntry', () => {
  it('renders the title and tone-coloured marker', () => {
    const w = mountEntry(entry())
    expect(w.text()).toContain('Title text')
    expect(w.get('span[aria-hidden="true"].rounded-full').classes().join(' ')).toContain(
      TIMELINE_TONE_MARKER[TimelineTone.SUCCESS].split(' ')[0],
    )
  })

  it('renders every line', () => {
    const w = mountEntry(entry({ lines: ['first line', 'second line'] }))
    expect(w.text()).toContain('first line')
    expect(w.text()).toContain('second line')
  })

  it('renders the note only when present', () => {
    expect(mountEntry(entry()).find('p.border-l-2').exists()).toBe(false)
    const w = mountEntry(entry({ note: 'Oilaviy sabab' }))
    expect(w.get('p.border-l-2').text()).toBe('Oilaviy sabab')
  })

  it('renders the amount with its tone class', () => {
    const w = mountEntry(entry({ amount: { text: '+10 so\'m', tone: TimelineTone.DANGER } }))
    const amount = w.get('span.font-mono')
    expect(amount.text()).toBe('+10 so\'m')
    expect(amount.classes()).toContain(TIMELINE_TONE_TEXT[TimelineTone.DANGER])
  })

  it('renders the badge next to the title', () => {
    const w = mountEntry(entry({ badge: { text: 'Pending!', variant: 'warning' } }))
    expect(w.text()).toContain('Pending!')
  })

  it('renders meta time, actor and group, and hides the row when all are empty', () => {
    const w = mountEntry(entry({ time: '14:05', actor: 'Teacher X', group: 'Feruza-2' }))
    expect(w.text()).toContain('14:05')
    expect(w.text()).toContain('Teacher X')
    expect(w.text()).toContain('Feruza-2')
    expect(mountEntry(entry()).find('p.text-xs').exists()).toBe(false)
  })

  it('shows only the meta parts that exist', () => {
    const w = mountEntry(entry({ actor: 'Teacher X' }))
    expect(w.find('span.font-mono').exists()).toBe(false)
    expect(w.text()).toContain('Teacher X')
  })

  it('draws the connector line unless it is the last entry of the day', () => {
    const connector = 'span.absolute[aria-hidden="true"]'
    expect(mountEntry(entry(), false).find(connector).exists()).toBe(true)
    expect(mountEntry(entry(), true).find(connector).exists()).toBe(false)
  })
})
