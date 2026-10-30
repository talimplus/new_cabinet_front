import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'

/** One discount period in the create/update body. Months are "YYYY-MM". */
export interface DiscountPeriodForm {
  /** Exactly one of `percent` / `amount` is sent (> 0). */
  percent?: number
  /** so'm per month */
  amount?: number
  /** Limit to one group; omitted — all of the student's groups. */
  groupId?: number
  fromMonth: string
  toMonth?: string
  reason?: string
}

/** POST /students and PUT /students/:id body. */
export interface StudentForm {
  firstName: string
  lastName: string
  phone: string
  secondPhone?: string
  birthDate?: string // "YYYY-MM-DD"
  comment?: string
  heardAboutUs?: string
  preferredTime?: StudentPreferredTime
  preferredDays?: WeekDay[]
  passportSeries?: string
  passportNumber?: string
  jshshir?: string
  referrerId?: number
  monthlyFee?: number
  discountPercent?: number
  /** so'm per month; sent instead of `discountPercent` when the type is "amount" */
  discountAmount?: number
  discountReason?: string
  /** First N months free; sent only when it differs from the stored value (0 on create is omitted). */
  freeMonths?: number
  discountPeriods?: DiscountPeriodForm[]
  status?: StudentStatus
  centerId?: number
  groupIds?: number[]
  /**
   * Edit-only, `YYYY-MM-DD`: the day the student joined the groups ADDED in
   * this edit (past allowed, not before a group's start). Sent only when it is
   * before today — billing starts on it; confirmed in StudentStartDialog.
   */
  groupJoinedAt?: string
  /** Any number of subjects; the first becomes `subjectId`. [] on update clears them. */
  subjectIds?: number[]
}
