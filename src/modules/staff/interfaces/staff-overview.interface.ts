import type { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PaymentMethod } from '@/shared/enums/payment-method.enum'
import type { PayrollStatus } from '@/modules/payroll/enums/payroll-status.enum'
import type { StaffDeductionType } from '../enums/staff-deduction-type.enum'

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
  /** Not withheld yet — it comes off the following months' salaries. */
  deductionOutstanding: number
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
  /** Earned before deductions. */
  baseSalary: number
  deductionAmount: number
  /** What actually reaches the employee: baseSalary − deductionAmount. */
  netSalary: number
  paidAmount: number
  remaining: number
  status: PayrollStatus
  appliedDeductions: AppliedDeduction[]
}

/** GET /staff/{userId}/overview and GET /staff/me/overview. */
export interface StaffOverview {
  user: StaffOverviewUser
  forMonth: string
  summary: StaffOverviewSummary
  months: StaffOverviewMonth[]
  lateRecords: StaffLateRecord[]
  attendanceRecords: StaffLateRecord[]
  unsettledReceipts: UnsettledReceipt[]
  deductions: StaffDeductionRow[]
  /** Null when no salary row exists for that month yet. */
  salary: StaffOverviewSalary | null
}

/** GET /staff/{userId}/deductions, and each row of `overview.deductions`. */
export interface StaffDeductionRow {
  id: number
  userId: number
  amount: number
  appliedAmount: number
  /** Still to be withheld from future salaries. */
  remainingAmount: number
  type: StaffDeductionType
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
