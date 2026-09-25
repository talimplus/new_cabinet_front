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
}
