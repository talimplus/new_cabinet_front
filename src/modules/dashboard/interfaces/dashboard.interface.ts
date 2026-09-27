export interface DashboardParams {
  /** Optional: the http interceptor injects the header's active center. */
  centerId?: number
  fromMonth: string
  toMonth: string
}

export interface PaymentsStats {
  amountDue: number
  amountPaid: number
  refundedAmount?: number
  remainingAmount: number
  totalCount: number
  paidCount: number
  partialCount: number
  unpaidCount: number
}

export interface ExpensesStats {
  totalAmount: number
  totalCount: number
}

export interface PayrollStats {
  amountDue: number
  amountPaid: number
  remainingAmount: number
  totalCount: number
  paidCount: number
  partialCount: number
  unpaidCount: number
}

export interface StudentsStats {
  totalCount: number
  activeCount: number
  addedCount: number
  stoppedCount: number
}

export interface PaymentByMethod {
  method?: string
  amount?: number
  count?: number
}

export interface MonthMoney {
  amountDue: number
  amountPaid: number
  remainingAmount: number
}

export interface MonthPayments extends MonthMoney {
  refundedAmount: number
}

export interface MonthExpenses {
  totalAmount: number
}

/**
 * One month of the range (`byMonth`, verified against the live API). Payroll's
 * month is the PAY month — the salary paid in it is for the previous month's work.
 */
export interface DashboardMonth {
  /** `YYYY-MM` */
  month: string
  payments: MonthPayments
  expenses: MonthExpenses
  payroll: MonthMoney
  netCashflow: number
}

/** GET /statistics/dashboard response (verified against the live API + old app). */
export interface DashboardResponse {
  centerId: number
  fromMonth: string
  toMonth: string
  payments: PaymentsStats
  paymentsByMethod: PaymentByMethod[]
  expenses: ExpensesStats
  payroll: PayrollStats
  students: StudentsStats
  netCashflow: number
  /** Every month of fromMonth..toMonth (both inclusive); the totals above are its sum. */
  byMonth: DashboardMonth[]
}
