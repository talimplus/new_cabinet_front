import type { SalaryTransfer } from './salary-transfer.interface'
import type { PayrollStatus } from '../enums/payroll-status.enum'

/** One group in "where the commission came from". */
export interface SalaryCommissionGroup {
  groupId: number
  groupName: string
  /** What students paid for this month (the teacher's part of a shared group). */
  paid: number
  /** paid × percent. */
  share: number
}

export interface SalaryCommission {
  percent: number
  groups: SalaryCommissionGroup[]
  total: number
}

/** Where (which salary month) a part of an advance / fine was withheld. */
export interface SalaryAllocation {
  /** "YYYY-MM-01". */
  month: string
  amount: number
}

/** An advance or a fine shown on a salary breakdown. */
export interface SalaryWithholding {
  id: number
  type: string
  amount: number
  reason: string
  /** "YYYY-MM-01" — the month the admin chose. */
  forMonth: string | null
  createdAt: string | null
  createdBy: string | null
  /** Withheld from THIS salary. */
  thisMonth: number
  allocations: SalaryAllocation[]
  /** Not withheld anywhere yet — comes off the next salaries. */
  notWithheld: number
}

export interface SalaryBonusItem {
  id: number
  amount: number
  reason: string
  createdAt: string | null
  createdBy: string | null
}

export interface SalaryPaymentItem {
  id: number
  amount: number
  comment: string | null
  paidAt: string | null
  paidBy: string | null
}

export interface SalaryTotals {
  /** Base + commission ± transfers + bonus. */
  calculated: number
  advance: number
  fines: number
  paid: number
  remaining: number
}

/** `GET /staff-salaries/details?userId=&forMonth=` — one salary, step by step. */
export interface SalaryDetails {
  id: number
  userId: number
  forMonth: string
  status: PayrollStatus
  user: { id: number; firstName: string; lastName: string; role: string; roleName: string | null }
  /** The month is not over yet — the commission keeps growing. */
  monthOpen: boolean
  /** Paid out in cash and closed: late money moves to the next salary. */
  closed: boolean
  /** Fixed monthly salary (teacher: the snapshot). */
  fixedSalary: number
  /** Teachers only. */
  commission: SalaryCommission | null
  transfers: { out: SalaryTransfer[]; in: SalaryTransfer[] }
  bonuses: SalaryBonusItem[]
  fines: SalaryWithholding[]
  advances: SalaryWithholding[]
  payments: SalaryPaymentItem[]
  /** Advances of this person not withheld anywhere yet. */
  advanceDebt: number
  totals: SalaryTotals
}
