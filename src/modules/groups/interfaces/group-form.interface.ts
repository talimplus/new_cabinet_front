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
  /** `YYYY-MM-DD`; `null` clears the term (open-ended). Omitted on create when empty. */
  endDate?: string | null
  /** Edit-only: when the price changed, whether it applies this month or next. */
  applyFeeFrom?: FeeApplyFrom
  days?: GroupFormDay[]
  /** Edit-only, `YYYY-MM-DD`: the new schedule applies from this day (default today). */
  scheduleEffectiveFrom?: string
  /** Edit-only, `YYYY-MM-DD`: the new teacher takes over from this day (default today). */
  teacherEffectiveFrom?: string
}
