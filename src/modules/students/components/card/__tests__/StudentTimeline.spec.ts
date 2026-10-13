import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import StudentTimeline from '../StudentTimeline.vue'
import StudentTimelineEntry from '../StudentTimelineEntry.vue'
import { UiSpinner } from '@/shared/components'
import { fetchStudentTimeline } from '../../../api/student-timeline.api'
import { TIMELINE_PAGE_SIZE } from '../../../composables/use-student-timeline'
import {
  StudentTimelineCategory as Cat,
  StudentTimelineType as T,
  TIMELINE_CATEGORY_LABEL_KEYS,
} from '../../../enums/student-timeline.enum'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { t } from '@/locales'
import type { StudentTimelineItem } from '../../../interfaces/student-timeline.interface'

vi.mock('../../../api/student-timeline.api', () => ({ fetchStudentTimeline: vi.fn() }))
const fetchMock = vi.mocked(fetchStudentTimeline)

let seq = 0
const item = (category: Cat = Cat.ATTENDANCE): StudentTimelineItem => ({
  id: `e:${++seq}`,
  type: T.ATTENDANCE,
  category,
  occurredAt: '2026-09-14',
  dateOnly: true,
  actor: null,
  group: null,
  details: { status: AttendanceStatus.ABSENT },
})

const mountTimeline = (props: { studentId: number | null; refreshKey?: unknown } = { studentId: 1 }) =>
  mount(StudentTimeline, { props })

describe('StudentTimeline', () => {
  beforeEach(() => {
    seq = 0
    fetchMock.mockReset()
  })

  it('shows a spinner while the first load is pending', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}))
    const w = mountTimeline()
    await flushPromises()
    expect(w.findComponent(UiSpinner).exists()).toBe(true)
    expect(w.text()).toContain(t('students.timeline.heading'))
  })

  it('renders entries grouped by day once loaded', async () => {
    fetchMock.mockResolvedValue({ items: [item(), item()] })
    const w = mountTimeline()
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledWith(1)
    expect(w.findComponent(UiSpinner).exists()).toBe(false)
    expect(w.findAllComponents(StudentTimelineEntry)).toHaveLength(2)
    expect(w.text()).toContain(t('students.timeline.title.absent'))
  })

  it('shows the empty text when there is no history (and no filter chips)', async () => {
    fetchMock.mockResolvedValue({ items: [] })
    const w = mountTimeline()
    await flushPromises()
    expect(w.text()).toContain(t('students.timeline.empty'))
    expect(w.find('[role="tablist"]').exists()).toBe(false)
  })

  it('shows emptyFiltered when the chosen filter has no hits', async () => {
    fetchMock.mockResolvedValue({ items: [item(Cat.ATTENDANCE), item(Cat.PAYMENTS)] })
    const w = mountTimeline()
    await flushPromises()
    // Filter chips only exist for non-empty buckets; drive the composable via the chip then reload
    // with data that no longer contains the selected category.
    const chip = w.findAll('[role="tab"]').find((b) => b.text().includes(t(TIMELINE_CATEGORY_LABEL_KEYS[Cat.PAYMENTS])))!
    await chip.trigger('click')
    fetchMock.mockResolvedValue({ items: [item(Cat.ATTENDANCE)] })
    await w.setProps({ refreshKey: 1 })
    await flushPromises()
    expect(w.text()).toContain(t('students.timeline.emptyFiltered'))
    expect(w.text()).not.toContain(t('students.timeline.empty'))
  })

  it('clicking a filter chip narrows the list', async () => {
    fetchMock.mockResolvedValue({ items: [item(Cat.ATTENDANCE), item(Cat.PAYMENTS), item(Cat.PAYMENTS)] })
    const w = mountTimeline()
    await flushPromises()
    const chip = w.findAll('[role="tab"]').find((b) => b.text().includes(t(TIMELINE_CATEGORY_LABEL_KEYS[Cat.ATTENDANCE])))!
    await chip.trigger('click')
    expect(w.findAllComponents(StudentTimelineEntry)).toHaveLength(1)
  })

  it('shows an error with a retry button that re-fetches', async () => {
    fetchMock.mockRejectedValueOnce(new Error('x'))
    const w = mountTimeline()
    await flushPromises()
    expect(w.text()).toContain(t('students.timeline.loadError'))

    fetchMock.mockResolvedValueOnce({ items: [item()] })
    const retry = w.findAll('button').find((b) => b.text() === t('students.timeline.retry'))!
    await retry.trigger('click')
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(w.text()).not.toContain(t('students.timeline.loadError'))
    expect(w.findAllComponents(StudentTimelineEntry)).toHaveLength(1)
  })

  it('shows "show more" with the remaining count and reveals the next page', async () => {
    fetchMock.mockResolvedValue({ items: Array.from({ length: TIMELINE_PAGE_SIZE + 4 }, () => item()) })
    const w = mountTimeline()
    await flushPromises()
    expect(w.findAllComponents(StudentTimelineEntry)).toHaveLength(TIMELINE_PAGE_SIZE)
    const more = w.findAll('button').find((b) => b.text() === t('students.timeline.showMore', { count: 4 }))
    expect(more).toBeDefined()
    await more!.trigger('click')
    expect(w.findAllComponents(StudentTimelineEntry)).toHaveLength(TIMELINE_PAGE_SIZE + 4)
    expect(w.text()).not.toContain(t('students.timeline.showMore', { count: 4 }))
  })

  it('refetches when refreshKey changes and when studentId changes', async () => {
    fetchMock.mockResolvedValue({ items: [item()] })
    const w = mountTimeline({ studentId: 1, refreshKey: 'a' })
    await flushPromises()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await w.setProps({ refreshKey: 'b' })
    expect(fetchMock).toHaveBeenCalledTimes(2)
    await w.setProps({ studentId: 2 })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenLastCalledWith(2)
  })

  it('does not fetch without a student id', async () => {
    mountTimeline({ studentId: null })
    await flushPromises()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
