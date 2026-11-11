import type { WeekDay } from '../enums/week-day.enum'
import type { FeeApplyFrom } from '../enums/fee-apply-from.enum'

export interface GroupFormDay {
  day: WeekDay
  startTime: string
}

/** POST/PUT /groups body. Note: schedules are sent as `days` (read back as `schedules`). */
export interface GroupForm {
  name: string
  centerId: number
  subjectId: number
  teacherId: number
  roomId: number
  monthlyFee: number | null
  /** Lesson length in minutes (defaults to 90 in the form). */
  lessonDurationMinutes?: number | null
  /**
   * `YYYY-MM-DD` — first lesson day; may be in the past. Omitted on create
   * when empty (backend: today) and on edit when unchanged.
   */
  startDate?: string
  /** Edit-only, with a changed `startDate`: members whose join date moves too. */
  backdateStudentIds?: number[]
  /** `YYYY-MM-DD`; `null` clears the term (open-ended). Omitted on create when empty. */
  endDate?: string | null
  /** Edit-only: when the price changed, whether it applies this month or next. */
  applyFeeFrom?: FeeApplyFrom
  days?: GroupFormDay[]
  /** Edit-only, `YYYY-MM-DD`: the new schedule applies from this day (default today). */
  scheduleEffectiveFrom?: string
  /** Edit-only, `YYYY-MM-DD`: the new teacher takes over from this day (default today). */
  teacherEffectiveFrom?: string
  /** Save even though the room/teacher is busy — sent only after the user ticks the warning. */
  allowScheduleConflicts?: boolean
}

/**
 * Partial PUT /groups/:id that only hands the group to another teacher. The
 * backend reads `teacherEffectiveFrom` only when `teacherId` really changed;
 * lessons before that day (and their commission) stay with the old teacher.
 */
export interface GroupTeacherChangeForm {
  teacherId: number
  /** `YYYY-MM-DD`, not in the future; the month the old teacher was paid for is a 422. */
  teacherEffectiveFrom: string
  allowScheduleConflicts?: boolean
}
