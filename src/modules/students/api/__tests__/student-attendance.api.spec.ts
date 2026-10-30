import { describe, it, expect, vi } from 'vitest'
import { fetchStudentAttendance } from '../student-attendance.api'
import { http } from '@/shared/api/http'

vi.mock('@/shared/api/http', () => ({ http: { get: vi.fn() } }))
const mockedHttp = vi.mocked(http, true)

describe('student-attendance.api', () => {
  it('GETs /students/{id}/attendance and returns the body', async () => {
    const body = { groups: [{ groupId: 1 }], items: [{ id: 5 }] }
    mockedHttp.get.mockResolvedValueOnce({ data: body })
    const result = await fetchStudentAttendance(7)
    expect(mockedHttp.get).toHaveBeenCalledWith('/students/7/attendance')
    expect(result).toEqual(body)
  })

  it('normalises a missing body to empty lists', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: null })
    expect(await fetchStudentAttendance(7)).toEqual({ groups: [], items: [] })
  })
})
