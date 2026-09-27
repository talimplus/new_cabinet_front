import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { useGroupForm } from '../use-group-form'
import { CONFLICT_CHECK_DELAY } from '../use-schedule-conflicts'
import { checkScheduleConflicts } from '@/modules/schedule/api/schedule.api'
import { WeekDay } from '../../enums/week-day.enum'
import { FeeApplyFrom } from '../../enums/fee-apply-from.enum'
import { toDateString } from '@/shared/utils/format-date'
import type { Group } from '../../interfaces/group.interface'

// The composable pulls select options through these fetchers — stub them so the
// centerId watcher's loadFor() resolves without touching the network.
vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
vi.mock('@/modules/rooms/api/rooms.api', () => ({
  fetchRooms: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchEmployees: vi.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
}))
// The live conflict check always runs alongside the form — stub it too, so no
// test can ever fire a real request even if it never enables `isOpen`.
vi.mock('@/modules/schedule/api/schedule.api', () => ({
  checkScheduleConflicts: vi.fn().mockResolvedValue([]),
}))

const mockedCheckScheduleConflicts = vi.mocked(checkScheduleConflicts)

function makeGroup(schedules: Group['schedules'], overrides: Partial<Group> = {}): Group {
  return {
    id: 42,
    name: 'A1 guruh',
    monthlyFee: 500000,
    lessonDurationMinutes: 120,
    center: { id: 7, name: 'Markaz' },
    subject: { id: 3, name: 'Ingliz tili' },
    room: { id: 4, name: '101' },
    teacher: { id: 9, firstName: 'Ali', lastName: 'Valiyev' },
    schedules,
    ...overrides,
  }
}

describe('useGroupForm', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('reset(null)', () => {
    it('applies the defaultCenterId getter and clears every other field', async () => {
      const f = useGroupForm(() => 5)
      f.reset(null)
      await flushPromises()

      expect(f.form.centerId).toBe(5)
      expect(f.form.name).toBe('')
      expect(f.form.subjectId).toBeNull()
      expect(f.form.roomId).toBeNull()
      expect(f.form.teacherId).toBeNull()
      expect(f.form.monthlyFee).toBe('')
      expect(f.form.lessonDurationMinutes).toBe(90)
      expect(f.form.endDate).toBeNull()
      expect(f.days.value).toEqual([])
      expect(f.times.value).toEqual([])
      expect(f.allTime.value).toBe('')
      expect(f.differentTime.value).toBe(false)
    })
  })

  describe('reset(editing)', () => {
    it('prefills the scalar fields from the group', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00' }]))
      await flushPromises()

      expect(f.form.name).toBe('A1 guruh')
      expect(f.form.centerId).toBe(7)
      expect(f.form.subjectId).toBe(3)
      expect(f.form.roomId).toBe(4)
      expect(f.form.teacherId).toBe(9)
      expect(f.form.monthlyFee).toBe(500000)
      expect(f.form.lessonDurationMinutes).toBe(120)
    })

    it('maps a single schedule to differentTime=false + allTime', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([{ day: WeekDay.WEDNESDAY, startTime: '14:30' }]))
      await flushPromises()

      expect(f.differentTime.value).toBe(false)
      expect(f.allTime.value).toBe('14:30')
      expect(f.times.value).toEqual([])
      expect(f.days.value).toEqual([WeekDay.WEDNESDAY])
    })

    it('maps multiple schedules to differentTime=true + a times[] array', async () => {
      const f = useGroupForm(() => 1)
      f.reset(
        makeGroup([
          { day: WeekDay.MONDAY, startTime: '09:00' },
          { day: WeekDay.FRIDAY, startTime: '16:00' },
        ]),
      )
      await flushPromises()

      expect(f.differentTime.value).toBe(true)
      expect(f.days.value).toEqual([WeekDay.MONDAY, WeekDay.FRIDAY])
      expect(f.times.value).toEqual(['09:00', '16:00'])
      expect(f.allTime.value).toBe('')
    })

    it('reads endDate as a Date and lessonDurationMinutes from the group', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00' }], { endDate: '2026-12-31' }))
      await flushPromises()

      expect(f.form.endDate).toBeInstanceOf(Date)
      // parseDate() builds local midnight — round-trip through the same
      // local-date formatter the composable uses, not toISOString() (which
      // would shift the day for any non-UTC timezone).
      expect(toDateString(f.form.endDate)).toBe('2026-12-31')
      expect(f.form.lessonDurationMinutes).toBe(120)
    })

    it('prefills monthlyFee from upcomingMonthlyFee when one is queued', async () => {
      const f = useGroupForm(() => 1)
      f.reset(
        makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00' }], {
          monthlyFee: 500000,
          upcomingMonthlyFee: 550000,
        }),
      )
      await flushPromises()

      expect(f.form.monthlyFee).toBe(550000)
      // feeChanged compares against the group's CURRENT price, not the prefilled one.
      expect(f.currentFee.value).toBe(500000)
    })

    it('falls back to monthlyFee when there is no upcomingMonthlyFee', async () => {
      const f = useGroupForm(() => 1)
      f.reset(
        makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00' }], {
          monthlyFee: 500000,
          upcomingMonthlyFee: null,
        }),
      )
      await flushPromises()

      expect(f.form.monthlyFee).toBe(500000)
    })
  })

  describe('feeChanged', () => {
    it('is false outside edit mode even if a fee is entered', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.monthlyFee = 600000

      expect(f.feeChanged.value).toBe(false)
    })

    it('is false in edit mode when the entered fee matches the original', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { monthlyFee: 500000 }))
      await flushPromises()

      expect(f.form.monthlyFee).toBe(500000)
      expect(f.feeChanged.value).toBe(false)
    })

    it('is true in edit mode when the entered fee differs from the original', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { monthlyFee: 500000 }))
      await flushPromises()
      f.form.monthlyFee = 600000

      expect(f.feeChanged.value).toBe(true)
    })
  })

  describe('isShortening', () => {
    it('is false outside edit mode', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.endDate = new Date('2026-01-01T00:00:00')

      expect(f.isShortening.value).toBe(false)
    })

    it('is true when the new endDate is earlier than the group previous endDate', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { endDate: '2026-12-31' }))
      await flushPromises()
      f.form.endDate = new Date('2026-06-01T00:00:00')

      expect(f.isShortening.value).toBe(true)
    })

    it('is false when the new endDate is later than the previous endDate', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { endDate: '2026-06-01' }))
      await flushPromises()
      f.form.endDate = new Date('2026-12-31T00:00:00')

      expect(f.isShortening.value).toBe(false)
    })

    it('is false when there was no previous endDate', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { endDate: null }))
      await flushPromises()
      f.form.endDate = new Date('2026-06-01T00:00:00')

      expect(f.isShortening.value).toBe(false)
    })
  })

  describe('validate()', () => {
    it('returns false and records errors when required fields are missing', async () => {
      const f = useGroupForm(() => null)
      f.reset(null)
      await flushPromises()

      expect(f.validate()).toBe(false)
      expect(f.errors.name).toBeTruthy()
      expect(f.errors.centerId).toBeTruthy()
      expect(f.errors.subjectId).toBeTruthy()
      expect(f.errors.roomId).toBeTruthy()
      expect(f.errors.teacherId).toBeTruthy()
      expect(f.errors.monthlyFee).toBeTruthy()
    })

    it('returns true and leaves no errors when every required field is set', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.name = 'B2'
      f.form.centerId = 1
      f.form.subjectId = 2
      f.form.roomId = 3
      f.form.teacherId = 4
      f.form.monthlyFee = 300000

      expect(f.validate()).toBe(true)
      expect(Object.keys(f.errors)).toHaveLength(0)
    })
  })

  describe('toPayload()', () => {
    it('collapses days with a shared time when differentTime=false', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.name = ' A1 '
      f.form.centerId = 1
      f.form.subjectId = 2
      f.form.roomId = 3
      f.form.teacherId = 4
      f.form.monthlyFee = '450000'
      f.form.lessonDurationMinutes = '120'
      f.days.value = [WeekDay.MONDAY, WeekDay.WEDNESDAY]
      f.differentTime.value = false
      f.allTime.value = '12:00'

      const payload = f.toPayload()

      expect(payload.name).toBe('A1') // trimmed
      expect(payload.monthlyFee).toBe(450000)
      expect(payload.lessonDurationMinutes).toBe(120)
      expect(payload.days).toEqual([
        { day: WeekDay.MONDAY, startTime: '12:00' },
        { day: WeekDay.WEDNESDAY, startTime: '12:00' },
      ])
    })

    it('uses the per-day times[] when differentTime=true', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.days.value = [WeekDay.MONDAY, WeekDay.FRIDAY]
      f.differentTime.value = true
      f.times.value = ['08:00', '18:00']

      const payload = f.toPayload()

      expect(payload.days).toEqual([
        { day: WeekDay.MONDAY, startTime: '08:00' },
        { day: WeekDay.FRIDAY, startTime: '18:00' },
      ])
    })

    it('coerces empty fee to null, falls back duration to 90, and omits days when there are none', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.monthlyFee = ''
      f.form.lessonDurationMinutes = ''

      const payload = f.toPayload()

      expect(payload.monthlyFee).toBeNull()
      expect(payload.lessonDurationMinutes).toBe(90)
      expect('days' in payload).toBe(false)
    })

    it('sends endDate as YYYY-MM-DD on create when set, and omits it when empty', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.form.endDate = new Date('2026-12-31T00:00:00')

      expect(f.toPayload().endDate).toBe('2026-12-31')

      f.form.endDate = null
      expect('endDate' in f.toPayload()).toBe(false)
    })

    // Clearing the end date on edit sends `null` to clear the term (not '').
    it('sends null on edit when endDate is cleared', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { endDate: '2026-12-31' }))
      await flushPromises()
      f.form.endDate = null

      expect(f.toPayload().endDate).toBeNull()
    })

    it('sends endDate as YYYY-MM-DD on edit when set', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { endDate: '2026-12-31' }))
      await flushPromises()
      f.form.endDate = new Date('2027-01-15T00:00:00')

      expect(f.toPayload().endDate).toBe('2027-01-15')
    })

    it('omits applyFeeFrom when the fee did not change', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { monthlyFee: 500000 }))
      await flushPromises()

      expect('applyFeeFrom' in f.toPayload()).toBe(false)
    })

    it('sends applyFeeFrom=current_month when the fee changed and applyFeeNow is true', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { monthlyFee: 500000 }))
      await flushPromises()
      f.form.monthlyFee = 600000
      f.form.applyFeeNow = true

      expect(f.toPayload().applyFeeFrom).toBe(FeeApplyFrom.CURRENT_MONTH)
    })

    it('sends applyFeeFrom=next_month when the fee changed and applyFeeNow is false', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([], { monthlyFee: 500000 }))
      await flushPromises()
      f.form.monthlyFee = 600000
      f.form.applyFeeNow = false

      expect(f.toPayload().applyFeeFrom).toBe(FeeApplyFrom.NEXT_MONTH)
    })
  })

  describe('setBackendErrors()', () => {
    it('maps a validation-error response into the errors record', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()

      f.setBackendErrors({ response: { data: { errors: { name: ['Bu nom band'] } } } })

      expect(f.errors.name).toBe('Bu nom band')
    })
  })

  describe('scheduleChanged / teacherChanged + effective-from dates', () => {
    // Local noon — so "today" is the same calendar day in every timezone.
    const NOW = new Date(2026, 8, 27, 12, 0, 0)

    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(NOW)
    })
    afterEach(() => vi.useRealTimers())

    const twoDays = (): Group['schedules'] => [
      { day: WeekDay.MONDAY, startTime: '09:00' },
      { day: WeekDay.FRIDAY, startTime: '16:00' },
    ]

    it('on create both flags are false and no effective-from dates are sent', async () => {
      const f = useGroupForm(() => 1)
      f.reset(null)
      await flushPromises()
      f.days.value = [WeekDay.MONDAY]
      f.allTime.value = '10:00'
      f.form.teacherId = 4

      expect(f.scheduleChanged.value).toBe(false)
      expect(f.teacherChanged.value).toBe(false)
      const payload = f.toPayload()
      expect('scheduleEffectiveFrom' in payload).toBe(false)
      expect('teacherEffectiveFrom' in payload).toBe(false)
    })

    it('on edit with unchanged schedule and teacher the payload has no effective-from dates', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()

      expect(f.scheduleChanged.value).toBe(false)
      expect(f.teacherChanged.value).toBe(false)
      const payload = f.toPayload()
      expect('scheduleEffectiveFrom' in payload).toBe(false)
      expect('teacherEffectiveFrom' in payload).toBe(false)
    })

    it('ignores seconds in the stored startTime (HH:mm:ss vs HH:mm)', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00:00' }]))
      await flushPromises()
      f.allTime.value = '10:00'

      expect(f.scheduleChanged.value).toBe(false)
    })

    it('changing the days flags scheduleChanged and sends today as scheduleEffectiveFrom', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.days.value = [WeekDay.MONDAY, WeekDay.THURSDAY]

      expect(f.scheduleChanged.value).toBe(true)
      expect(f.teacherChanged.value).toBe(false)
      const payload = f.toPayload()
      expect(payload.scheduleEffectiveFrom).toBe('2026-09-27')
      expect('teacherEffectiveFrom' in payload).toBe(false)
    })

    it('changing a start time also counts as a schedule change', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.times.value = ['09:00', '17:00']

      expect(f.scheduleChanged.value).toBe(true)
    })

    it('sends the picked scheduleEffectiveFrom date instead of today when changed', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.days.value = [WeekDay.TUESDAY, WeekDay.FRIDAY]
      f.form.scheduleEffectiveFrom = new Date(2026, 9, 5)

      expect(f.toPayload().scheduleEffectiveFrom).toBe('2026-10-05')
    })

    it('reordering the same days/times is NOT a change', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.days.value = [WeekDay.FRIDAY, WeekDay.MONDAY]
      f.times.value = ['16:00', '09:00']

      expect(f.scheduleChanged.value).toBe(false)
      expect('scheduleEffectiveFrom' in f.toPayload()).toBe(false)
    })

    it('changing teacherId flags teacherChanged and sends teacherEffectiveFrom', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.form.teacherId = 15

      expect(f.teacherChanged.value).toBe(true)
      expect(f.scheduleChanged.value).toBe(false)
      const payload = f.toPayload()
      expect(payload.teacherEffectiveFrom).toBe('2026-09-27')
      expect('scheduleEffectiveFrom' in payload).toBe(false)
    })

    it('picking the original teacher again clears teacherChanged', async () => {
      const f = useGroupForm(() => 1)
      f.reset(makeGroup(twoDays()))
      await flushPromises()
      f.form.teacherId = 15
      f.form.teacherId = 9

      expect(f.teacherChanged.value).toBe(false)
    })
  })

  describe('live schedule-conflict check', () => {
    beforeEach(() => vi.useFakeTimers())
    afterEach(() => vi.useRealTimers())

    it('checks conflicts with excludeGroupId when editing an existing group while the form is open', async () => {
      const f = useGroupForm(() => 1, () => true)
      f.reset(makeGroup([{ day: WeekDay.MONDAY, startTime: '10:00' }], { id: 14 }))
      await flushPromises()
      vi.advanceTimersByTime(CONFLICT_CHECK_DELAY)
      await flushPromises()

      expect(mockedCheckScheduleConflicts).toHaveBeenCalledWith(
        expect.objectContaining({ excludeGroupId: 14 }),
      )
    })
  })
})
