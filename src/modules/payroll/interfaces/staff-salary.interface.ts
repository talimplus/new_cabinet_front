import type { PayrollStatus } from '../enums/payroll-status.enum'
import type { StaffUser } from './staff-user.interface'
import type { PaymentHistoryItem } from './payment-history-item.interface'

/**
 * A staff member's salary record for a given month (`GET /staff-salaries`).
 * The `earning*` fields are present ONLY for teachers (commission-based pay).
 */
export interface StaffSalary {
  id: number
  userId: number
  forMonth: string
  baseSalary: number
  paidAmount: number
  /** Withheld from THIS month's salary (fines applied). */
  deductionAmount?: number
  /** baseSalary − deductionAmount. */
  netSalary?: number
  /** What is still owed to the employee; the backend already nets the fines. */
  remaining?: number
  /** Fines that did not fit this month and roll into the next ones. */
  deductionOutstanding?: number
  status: PayrollStatus
  paidAt: string | null
  comment: string | null
  createdAt: string
  user: StaffUser
  paymentHistory?: PaymentHistoryItem[]
  earningForMonth?: string
  earningBaseSalarySnapshot?: number
  earningCommissionAmount?: number
  earningCarryOverCommission?: number
  earningTotalEarning?: number
}
