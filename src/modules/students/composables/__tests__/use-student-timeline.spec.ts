import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fetchStudentTimeline } from '../../api/student-timeline.api'
import { useStudentTimeline, TIMELINE_PAGE_SIZE } from '../use-student-timeline'
import { StudentTimelineCategory as Cat, StudentTimelineType as T } from '../../enums/student-timeline.enum'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { formatDate, toDateString } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { StudentTimelineItem } from '../../interfaces/student-timeline.interface'

vi.mock('../../api/student-timeline.api', () => ({ fetchStudentTimeline: vi.fn() }))
const fetchMock = vi.mocked(fetchStudentTimeline)

let seq = 0
function item(over: Partial<StudentTimelineItem> = {}): StudentTimelineItem {
  seq += 1
  return {
    id: `e:${seq}`,
    type: T.ATTENDANCE,
    category: Cat.ATTENDANCE,
    occurredAt: '2026-09-14',
    dateOnly: true,
    actor: null,
    group: null,
    details: { status: AttendanceStatus.ABSENT },
    ...over,
  }
}

const many = (n: number, over: Partial<StudentTimelineItem> = {}) =>
  Array.from({ length: n }, () => item(over))

async function loaded(items: StudentTimelineItem[]) {
  fetchMock.mockResolvedValue({ items })
  const tl = useStudentTimeline(() => 1)
  await tl.load()
  return tl
}

describe('useStudentTimeline', () => {
  beforeEach(() => {
    seq = 0
    fetchMock.mockReset()
  })
  afterEach(() => vi.useRealTimers())

  it('load fills items and toggles loading', async () => {
    fetchMock.mockResolvedValue({ items: [item()] })
    const tl = useStudentTimeline(() => 7)
    const p = tl.load()
    expect(tl.loading.value).toBe(true)
    await p
    expect(fetchMock).toHaveBeenCalledWith(7)
    expect(tl.items.value).toHaveLength(1)
    expect(tl.loading.value).toBe(false)
    expect(tl.failed.value).toBe(false)
  })

  it('a rejection sets failed without throwing, and a retry clears it', async () => {
    fetchMock.mockRejectedValueOnce(new Error('x'))
    const tl = useStudentTimeline(() => 1)
    await expect(tl.load()).resolves.toBeUndefined()
    expect(tl.failed.value).toBe(true)
    expect(tl.loading.value).toBe(false)

    fetchMock.mockResolvedValueOnce({ items: [item()] })
    await tl.load()
    expect(tl.failed.value).toBe(false)
    expect(tl.items.value).toHaveLength(1)
  })

  it('does not fetch without a student id', async () => {
    const tl = useStudentTimeline(() => null)
    await tl.load()
    expect(fetchMock).not.toHaveBeenCalled()
    expect(tl.loading.value).toBe(false)
  })

  it('counts events per category', async () => {
    const tl = await loaded([
      item({ category: Cat.PAYMENTS }),
      item({ category: Cat.PAYMENTS }),
      item({ category: Cat.GROUPS }),
    ])
    expect(tl.counts.value).toEqual({ [Cat.PAYMENTS]: 2, [Cat.GROUPS]: 1 })
  })

  it('setCategory filters entries and null shows everything', async () => {
    const tl = await loaded([
      item({ category: Cat.PAYMENTS, dateOnly: true }),
      item({ category: Cat.GROUPS }),
      item({ category: Cat.GROUPS }),
    ])
    const total = () => tl.days.value.reduce((n, d) => n + d.entries.length, 0)
    expect(total()).toBe(3)
    tl.setCategory(Cat.GROUPS)
    expect(tl.category.value).toBe(Cat.GROUPS)
    expect(total()).toBe(2)
    tl.setCategory(null)
    expect(total()).toBe(3)
  })

  it('pages by TIMELINE_PAGE_SIZE with remaining and showMore', async () => {
    const tl = await loaded(many(TIMELINE_PAGE_SIZE * 2 + 5))
    const shown = () => tl.days.value.reduce((n, d) => n + d.entries.length, 0)
    expect(shown()).toBe(TIMELINE_PAGE_SIZE)
    expect(tl.remaining.value).toBe(TIMELINE_PAGE_SIZE + 5)
    tl.showMore()
    expect(shown()).toBe(TIMELINE_PAGE_SIZE * 2)
    expect(tl.remaining.value).toBe(5)
    tl.showMore()
    expect(shown()).toBe(TIMELINE_PAGE_SIZE * 2 + 5)
    expect(tl.remaining.value).toBe(0)
  })

  it('setCategory resets the page limit', async () => {
    const tl = await loaded(many(TIMELINE_PAGE_SIZE * 3))
    tl.showMore()
    tl.showMore()
    expect(tl.remaining.value).toBe(0)
    tl.setCategory(Cat.ATTENDANCE)
    expect(tl.remaining.value).toBe(TIMELINE_PAGE_SIZE * 2)
  })

  it('remaining is 0 when everything fits', async () => {
    const tl = await loaded(many(3))
    expect(tl.remaining.value).toBe(0)
  })

  describe('day grouping', () => {
    it('dateOnly items use the date string; consecutive same-day items share a day', async () => {
      const tl = await loaded([
        item({ occurredAt: '2026-09-14' }),
        item({ occurredAt: '2026-09-14' }),
        item({ occurredAt: '2026-09-10' }),
      ])
      expect(tl.days.value.map((d) => [d.key, d.entries.length])).toEqual([
        ['2026-09-14', 2],
        ['2026-09-10', 1],
      ])
      expect(tl.days.value[0]!.label).toBe(formatDate('2026-09-14'))
    })

    it('timestamps are keyed by the local calendar date', async () => {
      const iso = '2026-08-10T07:00:00.000Z'
      const tl = await loaded([item({ occurredAt: iso, dateOnly: false })])
      expect(tl.days.value[0]!.key).toBe(toDateString(new Date(iso)))
    })

    it('a timestamp and a dateOnly item on the same day share one group', async () => {
      const iso = '2026-08-10T07:00:00.000Z'
      const key = toDateString(new Date(iso))
      const tl = await loaded([
        item({ occurredAt: iso, dateOnly: false }),
        item({ occurredAt: key, dateOnly: true }),
      ])
      expect(tl.days.value).toHaveLength(1)
      expect(tl.days.value[0]!.entries).toHaveLength(2)
    })

    it('labels today and yesterday', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 9, 13, 12, 0, 0))
      const tl = await loaded([
        item({ occurredAt: '2026-10-13' }),
        item({ occurredAt: '2026-10-12' }),
        item({ occurredAt: '2026-10-11' }),
      ])
      expect(tl.days.value.map((d) => d.label)).toEqual([
        t('students.timeline.today'),
        t('students.timeline.yesterday'),
        formatDate('2026-10-11'),
      ])
    })
  })

  describe('overlapping loads', () => {
    it('drops a response overtaken by a newer load', async () => {
      let resolveSlow: (v: { items: StudentTimelineItem[] }) => void = () => {}
      fetchMock
        .mockImplementationOnce(() => new Promise((r) => { resolveSlow = r }))
        .mockResolvedValueOnce({ items: [item({ id: 'new' })] })
      const tl = useStudentTimeline(() => 1)

      const first = tl.load()
      await tl.load()
      resolveSlow({ items: [item({ id: 'old' })] })
      await first

      expect(tl.items.value.map((i) => i.id)).toEqual(['new'])
      expect(tl.loading.value).toBe(false)
    })

    it('clears the previous student and the filter when the id changes', async () => {
      let id = 1
      fetchMock.mockResolvedValueOnce({ items: [item({ id: 'a' })] })
      const tl = useStudentTimeline(() => id)
      await tl.load()
      tl.setCategory(Cat.PAYMENTS)

      id = 2
      let resolve: (v: { items: StudentTimelineItem[] }) => void = () => {}
      fetchMock.mockImplementationOnce(() => new Promise((r) => { resolve = r }))
      const pending = tl.load()

      expect(tl.items.value).toEqual([])
      expect(tl.category.value).toBeNull()
      resolve({ items: [item({ id: 'b' })] })
      await pending
      expect(tl.items.value.map((i) => i.id)).toEqual(['b'])
    })
  })
})
