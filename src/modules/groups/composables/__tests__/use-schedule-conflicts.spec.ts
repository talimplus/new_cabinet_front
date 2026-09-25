import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref, nextTick, effectScope } from 'vue'
import type { EffectScope } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useScheduleConflicts, CONFLICT_CHECK_DELAY } from '../use-schedule-conflicts'
import { checkScheduleConflicts } from '@/modules/schedule/api/schedule.api'
import { ScheduleConflictReason } from '@/modules/schedule/enums/schedule-conflict-reason.enum'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '../../enums/week-day.enum'
import { t } from '@/locales'
import type { ScheduleConflict, ScheduleConflictDay } from '@/modules/schedule/interfaces/schedule-conflict.interface'

vi.mock('@/modules/schedule/api/schedule.api', () => ({
  checkScheduleConflicts: vi.fn(),
}))

const mockedCheck = vi.mocked(checkScheduleConflicts)

let scope: EffectScope | undefined

function makeConflict(overrides: Partial<ScheduleConflict> = {}): ScheduleConflict {
  return {
    reason: ScheduleConflictReason.ROOM,
    day: WeekDay.MONDAY,
    requestedStartTime: '10:30:00',
    requestedEndTime: '12:00',
    groupId: 3,
    groupName: 'Frontend-2',
    startTime: '10:00:00',
    endTime: '11:30',
    roomId: 4,
    roomName: 'Xona-1',
    teacherId: 9,
    teacherName: 'Aziz Karimov',
    ...overrides,
  }
}

interface SourceOverrides {
  isOpen: boolean
  slots: ScheduleConflictDay[]
  roomId: number | null
  teacherId: number | null
  duration: number
  excludeGroupId: number | null
}

function setup(overrides: Partial<SourceOverrides> = {}) {
  const isOpen = ref(overrides.isOpen ?? false)
  const slots = ref<ScheduleConflictDay[]>(overrides.slots ?? [])
  const roomId = ref<number | null>(overrides.roomId ?? null)
  const teacherId = ref<number | null>(overrides.teacherId ?? null)
  const duration = ref(overrides.duration ?? 90)
  const excludeGroupId = ref<number | null>(overrides.excludeGroupId ?? null)

  scope = effectScope()
  const composable = scope.run(() =>
    useScheduleConflicts({
      isOpen: () => isOpen.value,
      slots: () => slots.value,
      roomId: () => roomId.value,
      teacherId: () => teacherId.value,
      duration: () => duration.value,
      excludeGroupId: () => excludeGroupId.value,
    }),
  )!

  return { isOpen, slots, roomId, teacherId, duration, excludeGroupId, ...composable }
}

describe('useScheduleConflicts', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
    vi.useRealTimers()
  })

  it('runs a check after the debounce with the correctly shaped body (incomplete slots filtered, null room/teacher/exclude → undefined)', async () => {
    mockedCheck.mockResolvedValueOnce([])
    const s = setup({ isOpen: false })
    s.isOpen.value = true
    s.slots.value = [
      { day: WeekDay.MONDAY, startTime: '10:30' },
      { day: WeekDay.TUESDAY, startTime: '' },
    ]
    s.roomId.value = 5
    s.duration.value = 60
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(mockedCheck).toHaveBeenCalledTimes(1)
    expect(mockedCheck).toHaveBeenCalledWith({
      days: [{ day: WeekDay.MONDAY, startTime: '10:30' }],
      roomId: 5,
      teacherId: undefined,
      lessonDurationMinutes: 60,
      excludeGroupId: undefined,
    })
  })

  it('debounces rapid changes into a single request using the latest values', async () => {
    mockedCheck.mockResolvedValueOnce([])
    const s = setup({ isOpen: true, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }], roomId: 1 })

    s.roomId.value = 2
    await nextTick()
    vi.advanceTimersByTime(200)
    s.roomId.value = 3
    await nextTick()
    vi.advanceTimersByTime(200)
    s.roomId.value = 4
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(mockedCheck).toHaveBeenCalledTimes(1)
    expect(mockedCheck).toHaveBeenCalledWith(expect.objectContaining({ roomId: 4 }))
  })

  it('never calls the API while isOpen is false', async () => {
    const s = setup({ isOpen: false, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }], roomId: 1 })
    s.slots.value = [{ day: WeekDay.MONDAY, startTime: '09:30' }]
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(mockedCheck).not.toHaveBeenCalled()
  })

  it('never calls the API when there is no complete slot', async () => {
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '' }] })
    s.roomId.value = 2
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(mockedCheck).not.toHaveBeenCalled()
  })

  it('never calls the API when neither a room nor a teacher is selected', async () => {
    const s = setup({ isOpen: true, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })
    s.duration.value = 120
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(mockedCheck).not.toHaveBeenCalled()
  })

  it('flips checking true while pending, then populates conflicts and checked on success', async () => {
    let resolveFn!: (v: ScheduleConflict[]) => void
    mockedCheck.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFn = resolve
        }),
    )
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })
    s.roomId.value = 2
    await nextTick()

    expect(s.checking.value).toBe(false)
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    expect(s.checking.value).toBe(true)
    expect(s.checked.value).toBe(false)

    const conflict = makeConflict()
    resolveFn([conflict])
    await flushPromises()

    expect(s.checking.value).toBe(false)
    expect(s.checked.value).toBe(true)
    expect(s.conflicts.value).toEqual([conflict])
  })

  it('a rejected check clears conflicts, leaves checked false, and never throws', async () => {
    mockedCheck.mockRejectedValueOnce(new Error('network'))
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })
    s.roomId.value = 2
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(s.conflicts.value).toEqual([])
    expect(s.checked.value).toBe(false)
    expect(s.checking.value).toBe(false)
  })

  it('drops a stale response that resolves after a later request already settled', async () => {
    const resolvers: Array<(v: ScheduleConflict[]) => void> = []
    mockedCheck.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvers.push(resolve)
        }),
    )
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })

    s.roomId.value = 2
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)

    s.roomId.value = 3
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)

    expect(resolvers).toHaveLength(2)

    const stale = makeConflict({ groupName: 'Stale group' })
    const fresh = makeConflict({ groupName: 'Fresh group' })
    resolvers[1]?.([fresh])
    await flushPromises()
    resolvers[0]?.([stale])
    await flushPromises()

    expect(s.conflicts.value).toEqual([fresh])
  })

  it('builds a human-readable message for a room conflict', async () => {
    const conflict = makeConflict()
    mockedCheck.mockResolvedValueOnce([conflict])
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })
    s.roomId.value = 4
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(s.messages.value).toEqual([
      t('schedule.conflict.room', {
        day: t(WEEK_DAY_LABEL_KEYS[WeekDay.MONDAY]),
        time: '10:30–12:00',
        room: 'Xona-1',
        teacher: 'Aziz Karimov',
        group: 'Frontend-2',
        busy: '10:00–11:30',
      }),
    ])
  })

  it('messages is empty when there are no conflicts', async () => {
    mockedCheck.mockResolvedValueOnce([])
    const s = setup({ isOpen: true, roomId: 1, slots: [{ day: WeekDay.MONDAY, startTime: '09:00' }] })
    s.roomId.value = 2
    await nextTick()
    vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
    await flushPromises()

    expect(s.messages.value).toEqual([])
  })
})
