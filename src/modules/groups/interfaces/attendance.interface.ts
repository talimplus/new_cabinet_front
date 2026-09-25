import type { AttendanceStatus } from '../enums/attendance-status.enum'

/** One student's status (+ optional comment) for a lesson date. */
export interface AttendanceItem {
  studentId: number
  status: AttendanceStatus
  comment?: string
}

/**
 * The attendance for a single date. The backend may return the per-student rows
 * under `rows` (current) OR `items` (legacy) — read whichever is present.
 */
export interface AttendanceByDate {
  exists: boolean
  rows?: AttendanceItem[]
  items?: AttendanceItem[]
}

/** A lesson-date override: the lesson was cancelled or an extra one was added. */
export interface LessonDateOverride {
  type: 'cancelled' | 'extra'
  reason?: string
}

/**
 * One student's enrollment window inside the group, as the lesson-dates endpoint
 * returns it. Cells outside the window are read-only in the matrix.
 */
export interface GroupStudentMembership {
  id: number
  firstName: string
  lastName: string
  /** Date the student joined this group (inclusive); `null` = no lower bound. */
  joinedAt: string | null
  /** Date the student left — EXCLUSIVE: the lesson on this date is already theirs no more. */
  leftAt?: string | null
}

/** GET /groups/{groupId}/attendance/lesson-dates response. */
export interface LessonDatesResponse {
  timezone: string
  today: string
  /** Per-student join/leave window; absent on older backends → no restriction. */
  students?: GroupStudentMembership[]
  lessonDates: string[]
  attendanceByDate: Record<string, AttendanceByDate>
  overridesByDate?: Record<string, LessonDateOverride>
}

/** Query params for the lesson-dates endpoint. */
export interface LessonDatesParams {
  mode?: 'last' | 'range'
  count?: number
  from?: string
  to?: string
}

/** POST /groups/{groupId}/attendance/submit body. */
export interface SubmitAttendancePayload {
  lessonDate: string
  items: AttendanceItem[]
}

/** POST /groups/{groupId}/attendance/reschedule body. */
export interface RescheduleAttendancePayload {
  fromDate?: string
  toDate: string
  reason?: string
}
