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
  /** Bonuses (mukofot) added to THIS month's salary. */
  bonusAmount?: number
  /** Withheld from THIS month's salary: fines + advances. */
  deductionAmount?: number
  /** The part of `deductionAmount` that is advances (avans). */
  advanceAmount?: number
  /** The part of `deductionAmount` that is fines: deductionAmount − advanceAmount. */
  fineAmount?: number
  /** base + bonus − fines. */
  earnedAmount?: number
  /** What is handed over in total: base + bonus − deductionAmount. */
  netSalary?: number
  /** netSalary − paidAmount; the backend already nets bonuses, fines and advances. */
  remaining?: number
  /** FINES that did not fit this month and roll into the next ones (no advances). */
  deductionOutstanding?: number
  /** Advances not withheld yet — they come off the following salaries. */
  advanceOutstanding?: number
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
