import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ref } from 'vue'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useAttendance } from '../use-attendance'
import {
  fetchLessonDates as fetchLessonDatesApi,
  submitAttendance as submitAttendanceApi,
  rescheduleAttendance as rescheduleAttendanceApi,
} from '../../api/attendance.api'
import { useUserStore } from '@/stores/user.store'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { AttendanceStatus } from '../../enums/attendance-status.enum'
import type { Student } from '@/modules/students/interfaces/student.interface'
import { StudentStatus } from '@/modules/students/enums/student-status.enum'
import type { LessonDatesResponse } from '../../interfaces/attendance.interface'

vi.mock('../../api/attendance.api', () => ({
  fetchLessonDates: vi.fn(),
  submitAttendance: vi.fn(),
  rescheduleAttendance: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchLessonDatesApi)
const mockedSubmit = vi.mocked(submitAttendanceApi)
const mockedReschedule = vi.mocked(rescheduleAttendanceApi)

const TODAY = '2026-09-06'
const PAST = '2026-09-04'
const FUTURE = '2026-09-08'

function makeStudent(id: number): Student {
  return { id, firstName: 'Ali', lastName: 'Vali', phone: '998900000000', status: StudentStatus.ACTIVE }
}

function makeData(overrides: Partial<LessonDatesResponse> = {}): LessonDatesResponse {
  return {
    timezone: 'Asia/Tashkent',
    today: TODAY,
    lessonDates: [PAST, TODAY, FUTURE],
    attendanceByDate: {},
    ...overrides,
  }
}

/** Authorization is key-based now, so specs grant keys, not roles. */
function setup(permissions: string[] = [ALL_PERMISSIONS]) {
  setActivePinia(createPinia())
  const userStore = useUserStore()
  userStore.user = {
    id: 1, email: 'a@b.c', role: UserRole.ADMIN, roleId: 1, roleName: 'Test',
    centerId: 1, permissions,
  }
  const students = ref<Student[]>([makeStudent(7)])
  return useAttendance(3, students)
}

describe('useAttendance', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue(makeData())
    mockedSubmit.mockResolvedValue(undefined)
    mockedReschedule.mockResolvedValue(undefined)
  })

  describe('canEditCell', () => {
    it('a user with * can edit today and past, never the future', async () => {
      const a = setup()
      await a.load()

      expect(a.canEditCell(TODAY)).toBe(true)
      expect(a.canEditCell(PAST)).toBe(true)
      expect(a.canEditCell(FUTURE)).toBe(false)
    })

    it('attendance.manage alone allows today but NOT past', async () => {
      const a = setup([Permission.ATTENDANCE_MANAGE])
      await a.load()

      expect(a.canEditCell(TODAY)).toBe(true)
      expect(a.canEditCell(PAST)).toBe(false)
    })

    it('cancelled dates are never editable', async () => {
      const a = setup()
      mockedFetch.mockResolvedValueOnce(
        makeData({ overridesByDate: { [TODAY]: { type: 'cancelled' } } }),
      )
      await a.load()

      expect(a.canEditCell(TODAY)).toBe(false)
    })
  })

  describe('saveCell', () => {
    it('builds a single-item payload from the picker and reloads lesson dates', async () => {
      const a = setup()
      await a.load()
      expect(mockedFetch).toHaveBeenCalledTimes(1)

      a.openCell(7, TODAY)
      a.picker.status = AttendanceStatus.LATE
      a.picker.comment = '5 daqiqa'
      await a.saveCell()
      await flushPromises()

      expect(mockedSubmit).toHaveBeenCalledWith(3, {
        lessonDate: TODAY,
        items: [{ studentId: 7, status: AttendanceStatus.LATE, comment: '5 daqiqa' }],
      })
      // initial load + reload after submit
      expect(mockedFetch).toHaveBeenCalledTimes(2)
      expect(a.picker.open).toBe(false)
    })

    it('refuses to submit an excused status without a comment', async () => {
      const a = setup()
      await a.load()

      a.openCell(7, TODAY)
      a.picker.status = AttendanceStatus.EXCUSED
      a.picker.comment = '   '
      await a.saveCell()

      expect(mockedSubmit).not.toHaveBeenCalled()
    })
  })

  describe('submitReschedule', () => {
    it('sends toDate + fromDate + reason and reloads', async () => {
      const a = setup()
      await a.load()

      a.reschedule.fromDate = TODAY
      a.reschedule.toDate = new Date('2026-09-10T00:00:00')
      a.reschedule.reason = 'bayram'
      await a.submitReschedule()
      await flushPromises()

      expect(mockedReschedule).toHaveBeenCalledWith(3, {
        toDate: '2026-09-10',
        fromDate: TODAY,
        reason: 'bayram',
      })
      expect(mockedFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('holidays', () => {
    it('is empty before load and when the response has no holidays', async () => {
      const a = setup()
      expect(a.holidays.value).toEqual([])
      await a.load()
      expect(a.holidays.value).toEqual([])
    })

    it('exposes data.holidays after load', async () => {
      const holidays = [{ fromDate: '2026-09-01', toDate: '2026-09-01', name: 'Mustaqillik' }]
      mockedFetch.mockResolvedValueOnce(makeData({ holidays }))
      const a = setup()
      await a.load()
      expect(a.holidays.value).toEqual(holidays)
    })
  })

  describe('month/year navigation', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-24T00:00:00'))
    })
    afterEach(() => {
      vi.useRealTimers()
    })

    it('defaults year/month to the current month', () => {
      const a = setup()
      expect(a.year.value).toBe(2026)
      expect(a.month.value).toBe(9)
    })

    it('always sends a range mode params with the selected month bounds', async () => {
      const a = setup()
      await a.load()
      expect(mockedFetch).toHaveBeenCalledWith(3, { mode: 'range', from: '2026-09-01', to: '2026-09-30' })
    })

    it('setMonth updates month and reloads with the new month range (leap year Feb)', async () => {
      const a = setup()
      await a.load()
      expect(mockedFetch).toHaveBeenCalledTimes(1)

      a.setYear(2024)
      a.setMonth(2)
      await flushPromises()

      expect(a.month.value).toBe(2)
      expect(a.year.value).toBe(2024)
      // setYear + setMonth each trigger their own reload
      expect(mockedFetch).toHaveBeenCalledTimes(3)
      expect(mockedFetch).toHaveBeenLastCalledWith(3, {
        mode: 'range',
        from: '2024-02-01',
        to: '2024-02-29',
      })
    })

    it('a non-leap year February range ends on the 28th', async () => {
      const a = setup()
      await a.load()

      a.setYear(2023)
      a.setMonth(2)
      await flushPromises()

      expect(mockedFetch).toHaveBeenLastCalledWith(3, {
        mode: 'range',
        from: '2023-02-01',
        to: '2023-02-28',
      })
    })

    it('setYear updates year and reloads', async () => {
      const a = setup()
      await a.load()
      expect(mockedFetch).toHaveBeenCalledTimes(1)

      a.setYear(2025)
      await flushPromises()

      expect(a.year.value).toBe(2025)
      expect(mockedFetch).toHaveBeenCalledTimes(2)
      expect(mockedFetch).toHaveBeenLastCalledWith(3, { mode: 'range', from: '2025-09-01', to: '2025-09-30' })
    })

    it('goToCurrentMonth resets to the current month/year and reloads', async () => {
      const a = setup()
      await a.load()

      a.setYear(2020)
      a.setMonth(1)
      await flushPromises()
      expect(a.year.value).toBe(2020)
      expect(a.month.value).toBe(1)

      a.goToCurrentMonth()
      await flushPromises()

      expect(a.year.value).toBe(2026)
      expect(a.month.value).toBe(9)
      expect(mockedFetch).toHaveBeenLastCalledWith(3, { mode: 'range', from: '2026-09-01', to: '2026-09-30' })
    })
  })

  describe('membership window (joinedAt inclusive … leftAt exclusive)', () => {
    const BEFORE_JOIN = '2026-09-01'
    const JOIN_DATE = '2026-09-04'
    const INSIDE = '2026-09-05'
    const LEAVE_DATE = '2026-09-08'
    const AFTER_LEAVE = '2026-09-09'

    function setupWithMembership(joinedAt: string | null, leftAt?: string | null) {
      const a = setup()
      mockedFetch.mockResolvedValueOnce(
        makeData({
          lessonDates: [BEFORE_JOIN, JOIN_DATE, INSIDE, LEAVE_DATE, AFTER_LEAVE],
          students: [{ id: 7, firstName: 'Ali', lastName: 'Vali', joinedAt, leftAt }],
        }),
      )
      return a
    }

    it('a date before joinedAt is outside the enrollment window', async () => {
      const a = setupWithMembership(JOIN_DATE)
      await a.load()
      expect(a.isOutsideEnrollment(7, BEFORE_JOIN)).toBe(true)
    })

    it('the joinedAt date itself is inside the window (inclusive)', async () => {
      const a = setupWithMembership(JOIN_DATE)
      await a.load()
      expect(a.isOutsideEnrollment(7, JOIN_DATE)).toBe(false)
    })

    it('a date inside the window is not restricted', async () => {
      const a = setupWithMembership(JOIN_DATE, LEAVE_DATE)
      await a.load()
      expect(a.isOutsideEnrollment(7, INSIDE)).toBe(false)
    })

    it('the leftAt date itself is outside the window (exclusive)', async () => {
      const a = setupWithMembership(JOIN_DATE, LEAVE_DATE)
      await a.load()
      expect(a.isOutsideEnrollment(7, LEAVE_DATE)).toBe(true)
    })

    it('a date after leftAt is outside the window', async () => {
      const a = setupWithMembership(JOIN_DATE, LEAVE_DATE)
      await a.load()
      expect(a.isOutsideEnrollment(7, AFTER_LEAVE)).toBe(true)
    })

    it('no membership entry / null joinedAt is not restricted', async () => {
      const a = setup()
      mockedFetch.mockResolvedValueOnce(makeData({ students: [] }))
      await a.load()
      expect(a.isOutsideEnrollment(999, TODAY)).toBe(false)

      const b = setupWithMembership(null)
      await b.load()
      expect(b.isOutsideEnrollment(7, BEFORE_JOIN)).toBe(false)
    })

    describe('enrollmentReason', () => {
      it('returns a non-empty translated reason before joinedAt', async () => {
        const a = setupWithMembership(JOIN_DATE)
        await a.load()
        expect(a.enrollmentReason(7, BEFORE_JOIN)).not.toBe('')
      })

      it('returns a non-empty translated reason on/after leftAt', async () => {
        const a = setupWithMembership(JOIN_DATE, LEAVE_DATE)
        await a.load()
        expect(a.enrollmentReason(7, LEAVE_DATE)).not.toBe('')
        expect(a.enrollmentReason(7, AFTER_LEAVE)).not.toBe('')
      })

      it('returns an empty string inside the window', async () => {
        const a = setupWithMembership(JOIN_DATE, LEAVE_DATE)
        await a.load()
        expect(a.enrollmentReason(7, INSIDE)).toBe('')
      })
    })

    it('openCell refuses to open the picker for an out-of-window cell even though the date is editable', async () => {
      const a = setupWithMembership(JOIN_DATE)
      await a.load()

      // BEFORE_JOIN is in the past relative to today (TODAY), so canEditCell would allow it.
      expect(a.canEditCell(BEFORE_JOIN)).toBe(true)
      a.openCell(7, BEFORE_JOIN)
      expect(a.picker.open).toBe(false)
    })
  })
})
