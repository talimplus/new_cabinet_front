import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTeacherToday } from '../today.api'
import { http } from '@/shared/api/http'
import { TeacherScope } from '../../enums/teacher-scope.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import type { TeacherToday } from '../../interfaces/teacher-today.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('today.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchTeacherToday GETs /teachers/me/today and returns the body', async () => {
    const body: TeacherToday = {
      date: '2026-09-24',
      scope: TeacherScope.TEACHER,
      canCheckIn: true,
      lessons: [
        {
          group: { id: 1, name: 'A1', status: GroupStatus.STARTED, subject: null, room: null },
          teacher: null,
          date: '2026-09-24',
          startTime: '09:00',
          lessonNumber: 1,
          hasSyllabus: false,
          topics: [],
          previousTopics: [],
        },
      ],
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchTeacherToday()

    expect(mockedHttp.get).toHaveBeenCalledWith('/teachers/me/today')
    expect(result).toEqual(body)
  })
})
