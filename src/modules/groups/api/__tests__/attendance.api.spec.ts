import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchLessonDates, submitAttendance, rescheduleAttendance } from '../attendance.api'
import { http } from '@/shared/api/http'
import { AttendanceStatus } from '../../enums/attendance-status.enum'
import type { LessonDatesResponse } from '../../interfaces/attendance.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('attendance.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchLessonDates GETs the group endpoint with the window params and returns the body', async () => {
    const body: LessonDatesResponse = {
      timezone: 'Asia/Tashkent',
      today: '2026-09-06',
      lessonDates: ['2026-09-04', '2026-09-06'],
      attendanceByDate: {},
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchLessonDates(3, { mode: 'last', count: 12 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/groups/3/attendance/lesson-dates', {
      params: { mode: 'last', count: 12 },
    })
    expect(result).toEqual(body)
  })

  it('submitAttendance POSTs the lessonDate + items body', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })
    const payload = {
      lessonDate: '2026-09-06',
      items: [{ studentId: 7, status: AttendanceStatus.PRESENT, comment: 'ok' }],
    }

    await submitAttendance(3, payload)

    expect(mockedHttp.post).toHaveBeenCalledWith('/groups/3/attendance/submit', payload)
  })

  it('rescheduleAttendance POSTs toDate + fromDate + reason', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })
    const payload = { fromDate: '2026-09-06', toDate: '2026-09-08', reason: 'holiday' }

    await rescheduleAttendance(3, payload)

    expect(mockedHttp.post).toHaveBeenCalledWith('/groups/3/attendance/reschedule', payload)
  })
})
