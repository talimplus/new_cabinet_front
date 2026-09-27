import type { Subject } from '@/modules/subjects/interfaces/subject.interface'
import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'
import type { ReturnLikelihood } from '../enums/return-likelihood.enum'

/** A discount period as returned by GET /students (and the discount-periods endpoint). */
export interface DiscountPeriod {
  id: number
  studentId?: number
  fromMonth: string // ISO date, e.g. "2026-01-01"
  toMonth?: string | null
  /** Either `percent` or `amount` is > 0 (verified against the live API). */
  percent: number
  /** so'm per month; applied to full months only */
  amount?: number
  /** Limited to one group (e.g. the cheaper subject); null — all groups. */
  groupId?: number | null
  reason?: string | null
  createdAt?: string
}

/**
 * A student row from GET /students. Note the backend returns `monthlyFee` and
 * `discountPercent` as STRINGS (e.g. "500000", "10") — coerce with Number() when
 * displaying/formatting.
 */
export interface Student {
  id: number
  firstName: string
  lastName: string
  phone: string
  secondPhone?: string | null
  birthDate?: string | null
  comment?: string | null
  heardAboutUs?: string | null
  preferredTime?: StudentPreferredTime | null
  preferredDays?: WeekDay[]
  passportSeries?: string | null
  passportNumber?: string | null
  jshshir?: string | null
  monthlyFee?: string | null
  discountPercent?: string | null
  /** so'm per month, the amount counterpart of `discountPercent` (string numeric) */
  discountAmount?: string | null
  discountReason?: string | null
  status: StudentStatus
  returnLikelihood?: ReturnLikelihood | null
  activatedAt?: string | null
  stoppedAt?: string | null
  centerId?: number
  subjectId?: number | null
  subject?: Subject | null
  groupIds?: number[]
  referrerId?: number | null
  discountPeriods?: DiscountPeriod[]
  createdAt?: string
  /** UI-only: per-row status-change spinner. */
  statusLoading?: boolean
}

/**
 * GET /students/{id}. Same record as a list row, except the relations are
 * expanded: `groups` are objects (the list carries `groupIds`) and `center` is
 * the full entity. Verified against the dev backend.
 */
export interface StudentDetail extends Student {
  groups?: Array<{ id: number; name: string; monthlyFee?: string | null }>
  center?: { id: number; name: string } | null
}
