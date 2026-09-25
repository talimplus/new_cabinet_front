import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { ScheduleConflictReason } from '../enums/schedule-conflict-reason.enum'

/** One lesson slot to check — `startTime` is "HH:mm" (backend also takes "HH:mm:ss"). */
export interface ScheduleConflictDay {
  day: WeekDay
  startTime: string
}

/** POST /group-schedule/conflicts body. Empty `startTime` is a 422 — filter first. */
export interface ScheduleConflictForm {
  days: ScheduleConflictDay[]
  roomId?: number
  teacherId?: number
  lessonDurationMinutes?: number
  /** The group being edited, so its own slots don't count as a clash. */
  excludeGroupId?: number
}

/** One clash from POST /group-schedule/conflicts (the response is a bare array). */
export interface ScheduleConflict {
  reason: ScheduleConflictReason
  day: WeekDay
  /** The slot being checked. */
  requestedStartTime: string
  requestedEndTime: string
  /** The group that already holds the slot. */
  groupId: number
  groupName: string
  startTime: string
  endTime: string
  roomId: number | null
  roomName: string | null
  teacherId: number | null
  teacherName: string | null
}
