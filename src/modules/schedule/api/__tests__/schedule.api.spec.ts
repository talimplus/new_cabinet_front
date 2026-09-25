import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchScheduleBoard, checkScheduleConflicts } from '../schedule.api'
import { http } from '@/shared/api/http'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { ScheduleConflictReason } from '../../enums/schedule-conflict-reason.enum'
import type { ScheduleBoard } from '../../interfaces/schedule-board.interface'
import type { ScheduleConflict, ScheduleConflictForm } from '../../interfaces/schedule-conflict.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('schedule.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchScheduleBoard GETs /group-schedule/board and returns the body', async () => {
    const body: ScheduleBoard = {
      rooms: [{ id: 1, name: '101' }],
      lessons: [
        {
          groupId: 10,
          groupName: 'Frontend-1',
          groupStatus: GroupStatus.STARTED,
          day: WeekDay.MONDAY,
          startTime: '09:00',
          endTime: '10:30',
          durationMinutes: 90,
          roomId: 1,
          roomName: '101',
          teacherId: 5,
          teacherName: 'Aziz Karimov',
          subjectId: 3,
          subjectName: 'Frontend',
        },
      ],
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchScheduleBoard()

    expect(mockedHttp.get).toHaveBeenCalledWith('/group-schedule/board')
    expect(result).toEqual(body)
  })

  it('checkScheduleConflicts POSTs /group-schedule/conflicts with skipGlobalError and returns the bare array body', async () => {
    const form: ScheduleConflictForm = {
      days: [{ day: WeekDay.MONDAY, startTime: '10:30' }],
      roomId: 4,
      teacherId: 9,
      lessonDurationMinutes: 90,
      excludeGroupId: 14,
    }
    const body: ScheduleConflict[] = [
      {
        reason: ScheduleConflictReason.ROOM,
        day: WeekDay.MONDAY,
        requestedStartTime: '10:30',
        requestedEndTime: '12:00',
        groupId: 3,
        groupName: 'Frontend-2',
        startTime: '10:00',
        endTime: '11:30',
        roomId: 4,
        roomName: 'Xona-1',
        teacherId: null,
        teacherName: null,
      },
    ]
    mockedHttp.post.mockResolvedValueOnce({ data: body })

    const result = await checkScheduleConflicts(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/group-schedule/conflicts', form, {
      skipGlobalError: true,
    })
    expect(result).toEqual(body)
  })
})
