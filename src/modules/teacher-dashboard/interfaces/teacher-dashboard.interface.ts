import type { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import type { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import type { SalaryStatus } from '../enums/salary-status.enum'

/** Query for GET /teachers/me/dashboard. */
export interface TeacherDashboardParams {
  /** `YYYY-MM`; the backend defaults to the current month. */
  month?: string
  /** Non-teacher viewers only — a teacher always gets their own figures. */
  teacherId?: number
}

/** Marks in the month; `rate` = (present + late) / all marks, %, null when none. */
export interface TeacherAttendanceStats {
  present: number
  late: number
  absent: number
  excused: number
  rate: number | null
}

/** Payment rows of the month (one row = one student in one group). */
export interface TeacherPaymentStats {
  paidCount: number
  partialCount: number
  unpaidCount: number
  amountDue: number
  amountPaid: number
  /** `amountDue − amountPaid` over the month's rows. */
  debt: number
  /** Taken by reception, not confirmed yet. */
  pendingAmount: number
}

export interface TeacherDashboardTotals extends TeacherPaymentStats {
  groupsCount: number
  /** Active students now in the teacher's groups, each counted once. */
  studentsCount: number
  /** Unpaid balance of every month up to the chosen one (the debtors' sum). */
  totalDebt: number
  attendance: TeacherAttendanceStats
}

export interface TeacherDashboardGroup extends TeacherPaymentStats {
  id: number
  name: string
  status: GroupStatus
  studentsCount: number
  attendance: TeacherAttendanceStats
}

export interface TeacherDashboardTrendPoint {
  /** `YYYY-MM`. */
  month: string
  amountDue: number
  amountPaid: number
  attendanceRate: number | null
}

export interface TeacherDashboardDebtor {
  studentId: number
  groupId: number
  firstName: string
  lastName: string
  phone: string | null
  groupName: string
  /** Every unpaid month up to the chosen one. */
  totalDebt: number
  /** The chosen month only. */
  monthDebt: number
  debtMonths: number
  /** The chosen month's row status; null when there is no row for it. */
  monthStatus: PaymentStatus | null
  pendingAmount: number
}

/** The teacher's own pay for the month (salary + commission); null before it is computed. */
export interface TeacherDashboardEarning {
  baseSalary: number
  commission: number
  carryOver: number
  total: number
}

/**
 * The month's salary row. `earnedAmount = baseSalary + bonusAmount − fineAmount`;
 * `netSalary = earnedAmount − advanceAmount` (handed over in total this month);
 * `remaining = netSalary − paidAmount`. `deductionAmount = fineAmount + advanceAmount`.
 */
export interface TeacherSalaryRow {
  /** Salary + commission. */
  baseSalary: number
  bonusAmount: number
  deductionAmount: number
  advanceAmount: number
  fineAmount: number
  earnedAmount: number
  netSalary: number
  paidAmount: number
  remaining: number
  status: SalaryStatus
}

/** A bonus added to the chosen month's salary. */
export interface TeacherSalaryBonus {
  id: number
  amount: number
  reason: string
  createdAt: string
}

/** An advance taken out of the chosen month's salary (what did not fit moves on). */
export interface TeacherSalaryAdvance {
  id: number
  amount: number
  /** Already withheld from salaries so far. */
  appliedAmount: number
  comment: string
  createdAt: string
}

export interface TeacherDashboardSalary {
  /** Null before the month's salary row exists. */
  row: TeacherSalaryRow | null
  bonuses: TeacherSalaryBonus[]
  advances: TeacherSalaryAdvance[]
  /** Advances not withheld yet — taken from later salaries. */
  advanceOutstanding: number
}

export interface TeacherDashboardTeacher {
  id: number
  fullName: string
}

/** GET /teachers/me/dashboard. */
export interface TeacherDashboardResponse {
  teacher: TeacherDashboardTeacher
  month: string
  totals: TeacherDashboardTotals
  earning: TeacherDashboardEarning | null
  salary: TeacherDashboardSalary
  groups: TeacherDashboardGroup[]
  /** The 6 months ending with the chosen one, oldest first. */
  trend: TeacherDashboardTrendPoint[]
  /** Biggest debt first, at most 100. */
  debtors: TeacherDashboardDebtor[]
}
