import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTeacherToday } from '../use-teacher-today'
import { fetchTeacherToday } from '../../api/today.api'
import { TeacherScope } from '../../enums/teacher-scope.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import type { TeacherToday, TodayLesson } from '../../interfaces/teacher-today.interface'

vi.mock('../../api/today.api', () => ({
  fetchTeacherToday: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchTeacherToday)

function makeLesson(overrides: Partial<TodayLesson> = {}): TodayLesson {
  return {
    group: { id: 1, name: 'A1', status: GroupStatus.STARTED, subject: null, room: null },
    teacher: null,
    date: '2026-09-24',
    startTime: '09:00',
    lessonNumber: 1,
    hasSyllabus: false,
    topics: [],
    previousTopics: [],
    ...overrides,
  }
}

function makeToday(overrides: Partial<TeacherToday> = {}): TeacherToday {
  return {
    date: '2026-09-24',
    scope: TeacherScope.TEACHER,
    canCheckIn: true,
    lessons: [],
    ...overrides,
  }
}

describe('useTeacherToday', () => {
  beforeEach(() => vi.clearAllMocks())

  it('load() fills data', async () => {
    const body = makeToday({ lessons: [makeLesson()] })
    mockedFetch.mockResolvedValueOnce(body)

    const c = useTeacherToday()
    expect(c.data.value).toBeNull()
    await c.load()

    expect(c.data.value).toEqual(body)
  })

  describe('isCenterScope', () => {
    it('is true only when scope is center', async () => {
      mockedFetch.mockResolvedValueOnce(makeToday({ scope: TeacherScope.CENTER }))
      const c = useTeacherToday()
      await c.load()
      expect(c.isCenterScope.value).toBe(true)
    })

    it('is false when scope is teacher', async () => {
      mockedFetch.mockResolvedValueOnce(makeToday({ scope: TeacherScope.TEACHER }))
      const c = useTeacherToday()
      await c.load()
      expect(c.isCenterScope.value).toBe(false)
    })

    it('is false before any data has loaded', () => {
      const c = useTeacherToday()
      expect(c.isCenterScope.value).toBe(false)
    })
  })

  describe('lessons', () => {
    it('sorts ascending by startTime', async () => {
      const late = makeLesson({ group: { id: 1, name: 'Late', status: GroupStatus.STARTED, subject: null, room: null }, startTime: '14:00' })
      const early = makeLesson({ group: { id: 2, name: 'Early', status: GroupStatus.STARTED, subject: null, room: null }, startTime: '08:00' })
      const mid = makeLesson({ group: { id: 3, name: 'Mid', status: GroupStatus.STARTED, subject: null, room: null }, startTime: '10:00' })
      mockedFetch.mockResolvedValueOnce(makeToday({ lessons: [late, early, mid] }))

      const c = useTeacherToday()
      await c.load()

      expect(c.lessons.value.map((l) => l.group.name)).toEqual(['Early', 'Mid', 'Late'])
    })

    it('sinks null start times to the end', async () => {
      const noTime = makeLesson({ group: { id: 1, name: 'NoTime', status: GroupStatus.STARTED, subject: null, room: null }, startTime: null })
      const early = makeLesson({ group: { id: 2, name: 'Early', status: GroupStatus.STARTED, subject: null, room: null }, startTime: '08:00' })
      mockedFetch.mockResolvedValueOnce(makeToday({ lessons: [noTime, early] }))

      const c = useTeacherToday()
      await c.load()

      expect(c.lessons.value.map((l) => l.group.name)).toEqual(['Early', 'NoTime'])
    })
  })
})
