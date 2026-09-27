import type { Subject } from '@/modules/subjects/interfaces/subject.interface'
import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'
import type { StudentStatus } from '../enums/student-status.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'

export interface StudentSummaryLesson {
  day: WeekDay
  /** "10:00:00" — trim to HH:mm for display. */
  startTime: string
}

export interface StudentSummaryGroup {
  id: number
  name: string
  monthlyFee: number
  days?: WeekDay[]
  schedule?: StudentSummaryLesson[]
}

/**
 * The profile half of GET /payments/student/{id}/summary. It is RICHER than
 * `GET /students/{id}`: `centerName`, `subject` and the groups' `schedule` only
 * exist here (verified against the dev backend), and the money fields arrive as
 * real numbers instead of decimal strings.
 */
export interface StudentSummaryProfile {
  id: number
  firstName: string
  lastName: string
  phone: string
  secondPhone?: string | null
  birthDate?: string | null
  preferredTime?: StudentPreferredTime | null
  preferredDays?: WeekDay[]
  studyDays?: WeekDay[]
  status: StudentStatus
  monthlyFee: number
  discountPercent: number
  /** so'm per month (0 — none); the amount counterpart of discountPercent */
  discountAmount?: number
  discountReason?: string | null
  centerId: number
  centerName?: string | null
  subject?: Subject | null
  groups: StudentSummaryGroup[]
}

export interface StudentSummaryTotals {
  totalDue: number
  totalPaid: number
  /** amountDue − amountPaid, across all months — the till's debt. */
  totalDebt: number
  /** Taken by reception, not yet confirmed. */
  totalPending: number
  totalReceived: number
  /** What is still collectable FROM THE STUDENT — the page's main figure. */
  payableNow: number
}

export interface StudentSummaryMonth {
  paymentId: number
  /** "2026-09". */
  forMonth: string
  groupId: number | null
  groupName: string
  amountDue: number
  amountPaid: number
  pendingAmount: number
  receivedAmount: number
  /** Cash-desk debt: amountDue − amountPaid. */
  remaining: number
  /** amountDue − receivedAmount. */
  payableNow: number
  status: PaymentStatus
  lessonsPlanned?: number
  lessonsBillable?: number
  lessonsExcused?: number
  effectiveBillable?: number
  /** The un-prorated monthly fee; shown struck through when `isProrated`. */
  fullAmount?: number
  perLessonAmount?: number
  isProrated?: boolean
  /** Discount percent applied to this group's fee this month. */
  discountPercent?: number
  /** Fixed so'm discount — once per student, on the main group's row only. */
  discountAmount?: number
  manualExcludedAmount?: number
  manualExcludedLessons?: number | null
  manualExcludedReason?: string | null
}

export interface StudentPaymentSummary {
  student: StudentSummaryProfile
  totals: StudentSummaryTotals
  /** Newest month first. */
  months: StudentSummaryMonth[]
  /** Only on the pay-debt response: one receipt per month that got paid. */
  checks?: PaymentCheck[]
}
