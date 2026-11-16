import type { PaginationMeta } from '@/shared/interfaces/paginated.interface'
import type { StatsIncomeStatus } from '../enums/stats-income-status.enum'
import type { StatsStudentsKind } from '../enums/stats-students-kind.enum'
import type { SalaryEntryKind } from '../enums/salary-entry-kind.enum'
import type { StudentStatus } from '@/modules/students/enums/student-status.enum'
import type { StatsRangeParams } from './stats-overview.interface'

export interface StatsDetailsParams extends StatsRangeParams {
  page?: number
  perPage?: number
  search?: string
  status?: StatsIncomeStatus
  kind?: StatsStudentsKind
}

/** Every inner page answers in this envelope; `summary` matches the block figure. */
export interface StatsDetailsResponse<T> {
  fromDate: string
  toDate: string
  data: T[]
  meta: PaginationMeta
  summary: { count: number; amount: number }
}

export interface StatsIncomeRow {
  id: number
  date: string
  amount: number
  method: string | null
  status: StatsIncomeStatus
  invoiceNo: number | null
  studentId: number
  studentName: string
  phone: string | null
  groupId: number | null
  groupName: string | null
  /** `YYYY-MM` — the month the money paid for. */
  forMonth: string
  receivedBy: string | null
}

export interface StatsExpenseRow {
  id: number
  date: string
  name: string
  description: string | null
  amount: number
  forMonth: string
}

export interface StatsSalaryRow {
  kind: SalaryEntryKind
  id: number
  date: string
  amount: number
  comment: string | null
  /** `YYYY-MM` — the work month (salary) or the month it is withheld from (advance). */
  forMonth: string | null
  userId: number
  fullName: string
}

export interface StatsStudentRow {
  id: number
  fullName: string
  phone: string | null
  status: StudentStatus
  date: string | null
  returnLikelihood: string | null
  groups: string | null
}

export interface StatsDebtRow {
  id: number
  studentId: number
  studentName: string
  phone: string | null
  status: StudentStatus
  groupId: number | null
  groupName: string | null
  forMonth: string
  amountDue: number
  amountPaid: number
  pendingAmount: number
  debt: number
}
