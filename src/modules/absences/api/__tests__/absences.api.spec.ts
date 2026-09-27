import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAbsences, saveAbsenceFollowUp } from '../absences.api'
import { http } from '@/shared/api/http'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import type {
  Absence,
  AbsenceFollowUpResponse,
  AbsencesResponse,
} from '../../interfaces/absence.interface'
import type { AbsencesParams } from '../../interfaces/absence-params.interface'
import type { AbsenceFollowUpForm } from '../../interfaces/absence-follow-up-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makeAbsence(overrides: Partial<Absence> = {}): Absence {
  return {
    id: 1,
    lessonDate: '2026-09-24',
    status: AttendanceStatus.ABSENT,
    comment: null,
    followUpNote: null,
    followedUpAt: null,
    followedUpBy: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: null },
    group: { id: 3, name: 'English A1' },
    teacher: { id: 10, firstName: 'Olim', lastName: 'Karimov' },
    absencesInRange: 1,
    ...overrides,
  }
}

describe('absences.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchAbsences GETs /attendance/absences with params and returns the body', async () => {
    const body: AbsencesResponse = {
      data: [makeAbsence(), makeAbsence({ id: 2, status: AttendanceStatus.EXCUSED })],
      meta: { total: 2, page: 1, perPage: 20, totalPages: 1 },
      summary: { absent: 1, excused: 1, notFollowedUp: 2 },
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const params: AbsencesParams = {
      page: 1,
      perPage: 20,
      from: '2026-09-17',
      to: '2026-09-24',
      groupId: 3,
      teacherId: 10,
      status: AttendanceStatus.ABSENT,
      followedUp: false,
      search: 'Ali',
    }
    const result = await fetchAbsences(params)

    expect(mockedHttp.get).toHaveBeenCalledWith('/attendance/absences', { params })
    expect(result).toEqual(body)
  })

  it('saveAbsenceFollowUp PUTs /attendance/absences/{id}/follow-up with the form and returns the body', async () => {
    const body: AbsenceFollowUpResponse = {
      id: 42,
      followUpNote: 'kasal',
      followedUpAt: '2026-09-24T10:00:00.000Z',
    }
    mockedHttp.put.mockResolvedValueOnce({ data: body })

    const form: AbsenceFollowUpForm = { note: 'kasal' }
    const result = await saveAbsenceFollowUp(42, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/attendance/absences/42/follow-up', form)
    expect(result).toEqual(body)
  })
})
