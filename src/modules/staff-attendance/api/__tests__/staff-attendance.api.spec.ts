import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchStaffAttendance,
  fetchStaffAttendanceReport,
  createManualAttendance,
  confirmStaffAttendance,
  deleteStaffAttendance,
} from '../staff-attendance.api'
import { http } from '@/shared/api/http'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import { AttendanceFlag } from '@/shared/enums/attendance-flag.enum'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'
import type { StaffAttendanceReport } from '../../interfaces/staff-attendance-report.interface'
import type { ManualAttendanceForm } from '../../interfaces/manual-attendance-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makeAttendance(overrides: Partial<StaffAttendance> = {}): StaffAttendance {
  return {
    id: 1,
    userId: 10,
    centerId: 1,
    workDate: '2026-09-24',
    checkInAt: '2026-09-24T04:10:00.000Z',
    firstLessonAt: null,
    lateMinutes: 0,
    source: AttendanceSource.SELF,
    confidence: AttendanceConfidence.HIGH,
    distanceMeters: null,
    geoMatched: true,
    ipMatched: true,
    flags: [],
    confirmedByUserId: null,
    confirmedAt: null,
    note: null,
    user: { id: 10, firstName: 'Ali', lastName: 'Valiyev' },
    ...overrides,
  }
}

describe('staff-attendance.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchStaffAttendance GETs /staff-attendance with params and returns the paginated body', async () => {
    const page = {
      data: [makeAttendance(), makeAttendance({ id: 2, flags: [AttendanceFlag.FAR_FROM_CENTER] })],
      meta: { total: 2, page: 1, perPage: 20, totalPages: 1 },
    }
    mockedHttp.get.mockResolvedValueOnce({ data: page })

    const params = { page: 1, perPage: 20, userId: 10, from: '2026-09-01', to: '2026-09-24', onlyLate: true }
    const result = await fetchStaffAttendance(params)

    expect(mockedHttp.get).toHaveBeenCalledWith('/staff-attendance', { params })
    expect(result).toEqual(page)
  })

  it('fetchStaffAttendanceReport GETs /staff-attendance/report with from/to params', async () => {
    const report: StaffAttendanceReport = {
      from: '2026-09-01',
      to: '2026-09-24',
      centerNotConfigured: false,
      rows: [],
    }
    mockedHttp.get.mockResolvedValueOnce({ data: report })

    const result = await fetchStaffAttendanceReport('2026-09-01', '2026-09-24')

    expect(mockedHttp.get).toHaveBeenCalledWith('/staff-attendance/report', {
      params: { from: '2026-09-01', to: '2026-09-24' },
    })
    expect(result).toEqual(report)
  })

  it('createManualAttendance POSTs /staff-attendance/manual with the form and returns the created record', async () => {
    const created = makeAttendance({ id: 9, source: AttendanceSource.MANUAL })
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const form: ManualAttendanceForm = {
      userId: 10,
      workDate: '2026-09-24',
      checkInTime: '09:00',
      note: 'kechikdi',
    }
    const result = await createManualAttendance(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/staff-attendance/manual', form)
    expect(result).toEqual(created)
  })

  it('confirmStaffAttendance POSTs /staff-attendance/{id}/confirm', async () => {
    mockedHttp.post.mockResolvedValueOnce({ data: undefined })

    await confirmStaffAttendance(5)

    expect(mockedHttp.post).toHaveBeenCalledWith('/staff-attendance/5/confirm')
  })

  it('deleteStaffAttendance DELETEs /staff-attendance/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteStaffAttendance(7)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/staff-attendance/7')
  })
})
