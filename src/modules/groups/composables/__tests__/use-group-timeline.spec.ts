import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { t } from '@/locales'
import { fetchGroupTimeline } from '../../api/group-timeline.api'
import { GROUP_TIMELINE_PAGE_SIZE, STUDENT_FOLD_MIN, useGroupTimeline } from '../use-group-timeline'
import { GroupTimelineCategory as Cat, GroupTimelineType as T } from '../../enums/group-timeline.enum'
import type { GroupTimelineData, GroupTimelineEvent } from '../../interfaces/group-timeline.interface'

vi.mock('../../api/group-timeline.api', () => ({ fetchGroupTimeline: vi.fn<(id: number) => Promise<unknown[]>>() }))
vi.mock('@/shared/composables/use-permissions', () => ({
  usePermissions: () => ({ canViewStudents: ref(true), canViewGroups: ref(true) }),
}))
const mockedFetch = vi.mocked(fetchGroupTimeline)

const ev = (type: T, date: string, data: GroupTimelineData = {}): GroupTimelineEvent =>
  ({ type, date, data, title: 'b' })
const student = (type: T, date: string, n: number) =>
  ev(type, date, { studentId: n, studentName: `S${n}` })

async function loaded(events: GroupTimelineEvent[]) {
  mockedFetch.mockResolvedValueOnce(events)
  const tl = useGroupTimeline(() => 5)
  await tl.load()
  return tl
}

describe('useGroupTimeline', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 21, 12, 0, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('loads events for the group id', async () => {
    const tl = await loaded([ev(T.GROUP_CREATED, '2026-10-01')])
    expect(mockedFetch).toHaveBeenCalledWith(5)
    expect(tl.items.value).toHaveLength(1)
    expect(tl.loading.value).toBe(false)
    expect(tl.failed.value).toBe(false)
  })

  it('flags failure and clears it on retry', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('boom'))
    const tl = useGroupTimeline(() => 5)
    await tl.load()
    expect(tl.failed.value).toBe(true)
    expect(tl.loading.value).toBe(false)
    mockedFetch.mockResolvedValueOnce([])
    await tl.load()
    expect(tl.failed.value).toBe(false)
  })

  it('counts events per category (unknown types fall into group)', async () => {
    const tl = await loaded([
      ev(T.GROUP_CREATED, '2026-10-01'),
      ev(T.TEACHER_CHANGED, '2026-10-02'),
      ev(T.LESSON_MOVED, '2026-10-03'),
      ev(T.SCHEDULE_SET, '2026-10-04'),
      ev('weird' as T, '2026-10-05'),
    ])
    expect(tl.counts.value).toEqual({ [Cat.GROUP]: 2, [Cat.TEACHER]: 1, [Cat.SCHEDULE]: 2 })
  })

  it('setCategory filters entries and resets the page limit', async () => {
    const many = Array.from({ length: GROUP_TIMELINE_PAGE_SIZE + 5 }, (_, i) =>
      ev(T.FEE_SET, `2026-09-${String((i % 28) + 1).padStart(2, '0')}`, { monthlyFee: i }))
    const tl = await loaded([ev(T.TEACHER_CHANGED, '2026-10-02'), ...many])
    tl.showMore()
    tl.setCategory(Cat.TEACHER)
    expect(tl.category.value).toBe(Cat.TEACHER)
    expect(tl.days.value.flatMap((d) => d.entries)).toHaveLength(1)
    tl.setCategory(null)
    expect(tl.remaining.value).toBe(6)
  })

  it('shows days oldest first, keeping the backend order inside a day', async () => {
    const tl = await loaded([
      ev(T.GROUP_FINISHED, '2026-10-21'),
      ev(T.PAUSE, '2026-10-20'),
      ev(T.TEACHER_CHANGED, '2026-10-20'),
      ev(T.GROUP_CREATED, '2026-09-01'),
    ])
    expect(tl.days.value.map((d) => d.key)).toEqual(['2026-09-01', '2026-10-20', '2026-10-21'])
    expect(tl.days.value[2]!.label).toBe(t('common.timeline.today'))
    expect(tl.days.value[1]!.label).toBe(t('common.timeline.yesterday'))
    expect(tl.days.value[1]!.entries.map((e) => e.title)).toEqual([
      t('groups.timeline.title.pause'),
      t('groups.timeline.title.teacherChanged'),
    ])
  })

  it('folds a burst of same-type student events into one entry with children', async () => {
    const events = Array.from({ length: STUDENT_FOLD_MIN }, (_, i) => student(T.STUDENT_JOINED, '2026-10-10', i + 1))
    const tl = await loaded([...events, ev(T.PAUSE, '2026-10-10')])
    const entries = tl.days.value[0]!.entries
    expect(entries).toHaveLength(2)
    const folded = entries.find((e) => e.children)!
    expect(folded.title).toBe(t('groups.timeline.title.studentsJoined', { count: STUDENT_FOLD_MIN }))
    expect(folded.children).toHaveLength(STUDENT_FOLD_MIN)
    expect(folded.children![0]!.subject?.text).toBe('S1')
  })

  it('keeps fewer than STUDENT_FOLD_MIN student events separate', async () => {
    const events = Array.from({ length: STUDENT_FOLD_MIN - 1 }, (_, i) => student(T.STUDENT_LEFT, '2026-10-10', i + 1))
    const tl = await loaded(events)
    const entries = tl.days.value[0]!.entries
    expect(entries).toHaveLength(STUDENT_FOLD_MIN - 1)
    expect(entries.every((e) => !e.children)).toBe(true)
  })

  it('does not fold across different days', async () => {
    const tl = await loaded([
      student(T.STUDENT_JOINED, '2026-10-10', 1),
      student(T.STUDENT_JOINED, '2026-10-10', 2),
      student(T.STUDENT_JOINED, '2026-10-09', 3),
    ])
    expect(tl.days.value.flatMap((d) => d.entries).every((e) => !e.children)).toBe(true)
  })

  it('pages entries: remaining and showMore', async () => {
    const total = GROUP_TIMELINE_PAGE_SIZE * 2 + 4
    const events = Array.from({ length: total }, (_, i) =>
      ev(T.FEE_SET, `2026-${String(Math.floor(i / 28) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`))
    const tl = await loaded(events)
    const count = () => tl.days.value.reduce((n, d) => n + d.entries.length, 0)
    expect(count()).toBe(GROUP_TIMELINE_PAGE_SIZE)
    expect(tl.remaining.value).toBe(total - GROUP_TIMELINE_PAGE_SIZE)
    tl.showMore()
    expect(count()).toBe(GROUP_TIMELINE_PAGE_SIZE * 2)
    tl.showMore()
    expect(count()).toBe(total)
    expect(tl.remaining.value).toBe(0)
  })
})
