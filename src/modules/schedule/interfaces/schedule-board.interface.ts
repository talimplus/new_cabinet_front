import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { GroupStatus } from '@/modules/groups/enums/group-status.enum'

/** A room column on the board. */
export interface ScheduleRoom {
  id: number
  name: string
}

/** One scheduled lesson slot (a group's recurring lesson on one weekday). */
export interface ScheduleLesson {
  groupId: number
  groupName: string
  groupStatus: GroupStatus
  day: WeekDay
  startTime: string
  endTime: string
  durationMinutes: number
  roomId: number | null
  roomName: string | null
  teacherId: number | null
  teacherName: string | null
  subjectId: number | null
  subjectName: string | null
}

/** GET /group-schedule/board response. */
export interface ScheduleBoard {
  rooms: ScheduleRoom[]
  lessons: ScheduleLesson[]
}
