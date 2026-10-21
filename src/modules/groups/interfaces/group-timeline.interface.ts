import type { WeekDay } from '../enums/week-day.enum'
import type { GroupTimelineType } from '../enums/group-timeline.enum'

/** One weekday of a schedule snapshot; `startTime` is `HH:mm:ss`. */
export interface GroupTimelineDay {
  day: WeekDay
  startTime: string
}

/**
 * Type-specific payload. Every field is optional — which ones arrive depends
 * on `type` (see `docs/01-api-integration.md`, group timeline).
 */
export interface GroupTimelineData {
  // teacher_assigned / teacher_changed
  teacherId?: number | null
  teacherName?: string | null
  previousTeacherId?: number | null
  previousTeacherName?: string | null
  // schedule_set / schedule_changed
  days?: GroupTimelineDay[]
  previousDays?: GroupTimelineDay[] | null
  // fee_set / fee_changed
  monthlyFee?: number
  previousMonthlyFee?: number | null
  // pause / lesson_moved
  fromDate?: string | null
  toDate?: string | null
  reason?: string | null
  createdByName?: string | null
  // student_* (`groupId/groupName` = the other group of a transfer)
  studentId?: number
  studentName?: string | null
  groupId?: number
  groupName?: string | null
}

/** One item of `GET /groups/:id/timeline` (newest first). */
export interface GroupTimelineEvent {
  /** `YYYY-MM-DD` the event took effect; a fee change is the month's 1st. */
  date: string
  type: GroupTimelineType
  /** Ready Uzbek sentence — the fallback for a type the client doesn't know. */
  title: string
  data: GroupTimelineData
}
