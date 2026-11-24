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

/** One permanent discount: percent OR amount, for one group (omitted — all groups). */
export interface BaseDiscountForm {
  groupId?: number
  percent?: number
  /** so'm per month */
  amount?: number
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
  /** Legacy single price for every group — the new form sends `groupFees`. */
  monthlyFee?: number
  /** Personal price per group (0 — group price); only the changed groups are sent. */
  groupFees?: GroupFeeForm[]
  /** Permanent discounts, the FULL list — a group not in it loses its discount. */
  baseDiscounts?: BaseDiscountForm[]
  /** Edit-only: every discount is dropped from this month, its payments (paid too) are rebilled. */
  clearDiscount?: boolean
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

/** One group's personal price in the student form. */
export interface GroupFeeForm {
  groupId: number
  /** 0 — the group's own price. */
  monthlyFee: number
}
