import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMyAttendanceToday, checkIn } from '../staff-attendance.api'
import { http } from '@/shared/api/http'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import type {
  StaffAttendanceToday,
  CheckInForm,
  CheckInResult,
} from '@/shared/interfaces/staff-attendance.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makeAttendance() {
  return {
    id: 1,
    userId: 5,
    centerId: 2,
    workDate: '2026-09-24',
    checkInAt: '2026-09-24T04:05:00.000Z',
    firstLessonAt: '2026-09-24T04:00:00.000Z',
    lateMinutes: 5,
    source: AttendanceSource.SELF,
    confidence: AttendanceConfidence.HIGH,
    distanceMeters: 12,
    geoMatched: true,
    ipMatched: true,
    flags: [],
    confirmedByUserId: null,
    confirmedAt: null,
    note: null,
  }
}

describe('staff-attendance.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchMyAttendanceToday GETs /staff-attendance/me/today and returns the body', async () => {
    const body: StaffAttendanceToday = {
      date: '2026-09-24',
      checkedIn: true,
      attendance: makeAttendance(),
      firstLessonAt: '2026-09-24T04:00:00.000Z',
      lessonsToday: 3,
      centerConfigured: true,
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchMyAttendanceToday()

    expect(mockedHttp.get).toHaveBeenCalledWith('/staff-attendance/me/today')
    expect(result).toEqual(body)
  })

  it('checkIn POSTs the form to /staff-attendance/check-in and returns the body', async () => {
    const form: CheckInForm = { deviceId: 'dev-1', latitude: 41.3, longitude: 69.2, accuracyMeters: 10 }
    const body: CheckInResult = { alreadyCheckedIn: false, attendance: makeAttendance() }
    mockedHttp.post.mockResolvedValueOnce({ data: body })

    const result = await checkIn(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/staff-attendance/check-in', form)
    expect(result).toEqual(body)
  })
})
