import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useSchedule, PX_PER_MINUTE } from '../use-schedule'
import { fetchScheduleBoard as fetchScheduleBoardApi } from '../../api/schedule.api'
import { WeekDay } from '@/modules/groups/enums/week-day.enum'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { t } from '@/locales'
import type { ScheduleBoard, ScheduleLesson } from '../../interfaces/schedule-board.interface'

import type * as ScheduleApiModule from '../../api/schedule.api'

type ScheduleApi = typeof ScheduleApiModule

vi.mock('../../api/schedule.api', () => ({
  fetchScheduleBoard: vi.fn<ScheduleApi['fetchScheduleBoard']>(),
}))

const mockedFetchScheduleBoard = vi.mocked(fetchScheduleBoardApi)

function makeLesson(overrides: Partial<ScheduleLesson> = {}): ScheduleLesson {
  return {
    groupId: 1,
    groupName: 'Frontend-1',
    groupStatus: GroupStatus.STARTED,
    day: WeekDay.MONDAY,
    startTime: '09:00',
    endTime: '10:00',
    durationMinutes: 60,
    roomId: 1,
    roomName: '101',
    teacherId: 5,
    teacherName: 'Aziz Karimov',
    subjectId: 3,
    subjectName: 'Frontend',
    ...overrides,
  }
}

// Room 1, Monday: two overlapping lessons (09:00-10:30 & 10:00-11:00).
const overlapA = makeLesson({ groupId: 1, groupName: 'A', startTime: '09:00', endTime: '10:30', roomId: 1 })
const overlapB = makeLesson({ groupId: 2, groupName: 'B', startTime: '10:00', endTime: '11:00', roomId: 1 })
// Room 1, Monday: a lesson well after the overlapping pair — its own cluster.
const standalone = makeLesson({ groupId: 3, groupName: 'C', startTime: '14:00', endTime: '15:00', roomId: 1 })
// Room 2, Monday: alone in its room — never conflicts with room 1's lessons.
const otherRoom = makeLesson({ groupId: 4, groupName: 'D', startTime: '09:00', endTime: '10:00', roomId: 2, roomName: '102' })
// No room assigned — goes to the trailing 'no-room' column.
const noRoom = makeLesson({ groupId: 5, groupName: 'E', startTime: '11:00', endTime: '12:00', roomId: null, roomName: null })
// Tuesday lesson — used to assert day filtering.
const tuesdayLesson = makeLesson({ groupId: 6, groupName: 'F', day: WeekDay.TUESDAY, startTime: '09:00', endTime: '10:00', roomId: 1 })

function makeBoard(): ScheduleBoard {
  return {
    rooms: [
      { id: 1, name: '101' },
      { id: 2, name: '102' },
    ],
    lessons: [overlapA, overlapB, standalone, otherRoom, noRoom, tuesdayLesson],
  }
}

describe('useSchedule', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetchScheduleBoard.mockResolvedValue(makeBoard())
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('exports PX_PER_MINUTE as 1.2', () => {
    expect(PX_PER_MINUTE).toBe(1.2)
  })

  describe('load()', () => {
    it('fills board with the fetched schedule', async () => {
      const s = useSchedule()
      expect(s.board.value).toBeNull()

      await s.load()

      expect(mockedFetchScheduleBoard).toHaveBeenCalledTimes(1)
      expect(s.board.value).toEqual(makeBoard())
      expect(s.loading.value).toBe(false)
    })
  })

  describe('selectedDay default', () => {
    it('defaults to the current weekday, remapped so Monday is first (Monday -> MONDAY)', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-21T10:00:00')) // a Monday
      const s = useSchedule()
      expect(s.selectedDay.value).toBe(WeekDay.MONDAY)
    })

    it('defaults to SUNDAY when JS getDay() is 0', () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2026-09-27T10:00:00')) // a Sunday
      const s = useSchedule()
      expect(s.selectedDay.value).toBe(WeekDay.SUNDAY)
    })
  })

  describe('setDay() / dayLessons', () => {
    it('switches the selected day and filters lessons to that day only', async () => {
      const s = useSchedule()
      await s.load()

      s.setDay(WeekDay.TUESDAY)

      expect(s.selectedDay.value).toBe(WeekDay.TUESDAY)
      expect(s.dayLessons.value).toEqual([tuesdayLesson])
    })

    it('dayLessons only includes lessons matching the currently selected day', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const groupIds = s.dayLessons.value.map((l) => l.groupId).sort()
      expect(groupIds).toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('columns', () => {
    it('has one column per room plus a trailing no-room column for orphan lessons', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      expect(s.columns.value.map((c) => c.key)).toEqual(['room-1', 'room-2', 'no-room'])

      const room1 = s.columns.value[0]!
      expect(room1.name).toBe('101')
      expect(room1.items.map((p) => p.lesson.groupId).sort()).toEqual([1, 2, 3])

      const room2 = s.columns.value[1]!
      expect(room2.name).toBe('102')
      expect(room2.items.map((p) => p.lesson.groupId)).toEqual([4])

      const noRoomCol = s.columns.value[2]!
      expect(noRoomCol.id).toBeNull()
      expect(noRoomCol.name).toBe(t('schedule.noRoomColumn'))
      expect(noRoomCol.items.map((p) => p.lesson.groupId)).toEqual([5])
    })

    it('omits the no-room column when every lesson has a room', async () => {
      mockedFetchScheduleBoard.mockResolvedValueOnce({
        rooms: [{ id: 1, name: '101' }],
        lessons: [otherRoom].map((l) => ({ ...l, roomId: 1, roomName: '101' })),
      })
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      expect(s.columns.value.map((c) => c.key)).toEqual(['room-1'])
    })
  })

  describe('positioning (top/height)', () => {
    it('computes top/height from PX_PER_MINUTE for a standalone lesson', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const room1 = s.columns.value[0]!
      const positioned = room1.items.find((p) => p.lesson.groupId === 3)! // 14:00-15:00, no overlap

      // gridStart is 08:00 (480min) since all Monday lessons sit inside 08:00-20:00.
      expect(s.gridStart.value).toBe(480)
      expect(positioned.top).toBe((14 * 60 - 480) * PX_PER_MINUTE) // 432
      expect(positioned.height).toBe(Math.max(60, 30) * PX_PER_MINUTE - 4) // 68
    })

    it('grid defaults to 08:00-20:00 (gridStart=480, gridEnd=1200, gridHeight=864) when lessons fit inside it', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      expect(s.gridStart.value).toBe(480)
      expect(s.gridHeight.value).toBe((1200 - 480) * PX_PER_MINUTE)
    })
  })

  describe('conflict / lane logic', () => {
    it('flags two overlapping lessons in the same room+day as overlap:true with distinct lanes', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const room1 = s.columns.value[0]!
      const a = room1.items.find((p) => p.lesson.groupId === 1)!
      const b = room1.items.find((p) => p.lesson.groupId === 2)!

      expect(a.overlap).toBe(true)
      expect(b.overlap).toBe(true)
      expect(a.lane).not.toBe(b.lane)
      expect(b.lanes).toBeGreaterThanOrEqual(2)
    })

    // The final lane count is applied to the WHOLE cluster after packing, so both
    // overlapping lessons split the column evenly (fixed in `place()`).
    it('every lesson in an overlapping cluster reports the same final lane count', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const room1 = s.columns.value[0]!
      const a = room1.items.find((p) => p.lesson.groupId === 1)!
      const b = room1.items.find((p) => p.lesson.groupId === 2)!

      expect(a.lanes).toBeGreaterThanOrEqual(2)
      expect(a.lanes).toBe(b.lanes)
    })

    it('does not flag two non-overlapping lessons in the same room as a conflict', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const room1 = s.columns.value[0]!
      const standaloneItem = room1.items.find((p) => p.lesson.groupId === 3)!

      expect(standaloneItem.overlap).toBe(false)
      expect(standaloneItem.lane).toBe(0)
      expect(standaloneItem.lanes).toBe(1)
    })

    it('never conflicts lessons placed in different rooms', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      const room2 = s.columns.value[1]!
      const d = room2.items.find((p) => p.lesson.groupId === 4)!

      expect(d.overlap).toBe(false)
      expect(d.lane).toBe(0)
      expect(d.lanes).toBe(1)
    })
  })

  describe('hourMarks', () => {
    it('has one entry per hour from gridStart to gridEnd inclusive', async () => {
      const s = useSchedule()
      await s.load()
      s.setDay(WeekDay.MONDAY)

      expect(s.hourMarks.value).toHaveLength(13) // 08:00..20:00 inclusive
      expect(s.hourMarks.value[0]).toEqual({ label: '08:00', top: 0 })
      expect(s.hourMarks.value[s.hourMarks.value.length - 1]).toEqual({
        label: '20:00',
        top: (1200 - 480) * PX_PER_MINUTE,
      })
    })
  })
})
