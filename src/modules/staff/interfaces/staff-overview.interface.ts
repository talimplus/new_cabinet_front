import type { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PaymentMethod } from '@/shared/enums/payment-method.enum'
import type { PayrollStatus } from '@/modules/payroll/enums/payroll-status.enum'
import type { StaffDeductionType } from '../enums/staff-deduction-type.enum'
import type { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StaffBonusRow } from './staff-pay-extras.interface'

export interface StaffOverviewUser {
  id: number
  firstName: string
  lastName: string
  phone: string
  login: string
  role: string
  /** Admin-defined role name ("Kassir"); falls back to `role` when null. */
  roleName: string | null
  centerId: number | null
  centerName: string | null
  salary: number
  commissionPercentage: number
  createdAt: string
}

export interface StaffOverviewSummary {
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
  /** Money this employee took but an admin has not confirmed — on them. */
  unsettledCount: number
  unsettledAmount: number
  rejectedCount: number
  rejectedAmount: number
  deductionThisMonth: number
  /** FINES not withheld yet — they come off the following months' salaries. */
  deductionOutstanding: number
  /** Advances written for this month. */
  advanceThisMonth?: number
  /** Advances not withheld yet — carried to the following salaries. */
  advanceOutstanding?: number
  bonusThisMonth?: number
}

export interface StaffOverviewMonth {
  month: string
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
}

/** A late arrival row (a slice of the staff-attendance record). */
export interface StaffLateRecord {
  id: number
  workDate: string
  checkInAt: string | null
  firstLessonAt: string | null
  lateMinutes: number
  confidence: string
}

export interface UnsettledReceipt {
  id: number
  amount: number
  status: ReceiptStatus
  paymentMethod: PaymentMethod | null
  checkNo: string | null
  transactionNo: string | null
  receivedAt: string
  comment: string | null
  student: { id: number; firstName: string; lastName: string } | null
  group: { id: number; name: string } | null
  forMonth: string | null
}

/** One withheld slice of a deduction, as charged to a given month's salary. */
export interface AppliedDeduction {
  id: number
  deductionId: number
  amount: number
  reason: string | null
  type: StaffDeductionType | null
  /** The month the deduction was written for — may predate this salary. */
  sourceForMonth: string | null
}

export interface StaffOverviewSalary {
  id: number
  forMonth: string
  /** Earned before bonuses and deductions. */
  baseSalary: number
  bonusAmount?: number
  /** Everything withheld this month: fines + advances. */
  deductionAmount: number
  /** The part of `deductionAmount` that is advances. */
  advanceAmount?: number
  /** deductionAmount − advanceAmount. */
  fineAmount?: number
  /** base + bonus − fines. */
  earnedAmount?: number
  /** What is still handed over in total: base + bonus − deductionAmount. */
  netSalary: number
  paidAmount: number
  remaining: number
  status: PayrollStatus
  appliedDeductions: AppliedDeduction[]
}

/**
 * GET /staff/{userId}/overview and GET /staff/me/overview. The advance/bonus
 * fields are optional only so older fixtures/responses still type-check.
 */
export interface StaffOverview {
  user: StaffOverviewUser
  forMonth: string
  summary: StaffOverviewSummary
  months: StaffOverviewMonth[]
  lateRecords: StaffLateRecord[]
  attendanceRecords: StaffLateRecord[]
  unsettledReceipts: UnsettledReceipt[]
  /** Fines only (all months, newest first). */
  deductions: StaffDeductionRow[]
  /** Advances (`type: 'advance'`), all months, newest first. */
  advances?: StaffDeductionRow[]
  bonuses?: StaffBonusRow[]
  /** Null when no salary row exists for that month yet. */
  salary: StaffOverviewSalary | null
  /** Teachers only: groups that are not finished (started first). Empty for other roles. */
  groups: StaffTeacherGroup[]
}

/** One lesson slot of a teacher's group; `startTime` is "HH:mm". */
export interface StaffTeacherGroupSchedule {
  day: WeekDay
  startTime: string
}

/** A group the employee teaches — `overview.groups[]`. */
export interface StaffTeacherGroup {
  id: number
  name: string
  status: GroupStatus
  subject: string | null
  room: string | null
  studentsCount: number
  startDate: string | null
  endDate: string | null
  schedules: StaffTeacherGroupSchedule[]
}

/** GET /staff/{userId}/deductions, each row of `overview.deductions` and `overview.advances`. */
export interface StaffDeductionRow {
  id: number
  userId: number
  amount: number
  appliedAmount: number
  /** Still to be withheld from future salaries. */
  remainingAmount: number
  type: StaffDeductionType
  /** For an advance: the comment, or 'Avans'. */
  reason: string
  sourceForMonth: string | null
  settledAt: string | null
  createdAt: string
  createdBy: { id: number; firstName: string; lastName: string } | null
}

/** Body for POST /staff/deductions. */
export interface StaffDeductionForm {
  userId: number
  amount: number
  reason: string
  type?: StaffDeductionType
  /** "YYYY-MM" — defaults to the current month server-side. */
  forMonth?: string
}
