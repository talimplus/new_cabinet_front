/** Day range of the statistics pages (both ends inclusive, `YYYY-MM-DD`). */
export interface StatsRangeParams {
  fromDate: string
  toDate: string
}

export interface StatsAmountCount {
  amount: number
  count: number
}

export interface StatsMethodAmount extends StatsAmountCount {
  /** `cash` / `card` / `bank_transfer` / `online` / `unknown`. */
  method: string
}

export interface StatsIncome extends StatsAmountCount {
  byMethod: StatsMethodAmount[]
}

export interface StatsSalaries extends StatsAmountCount {
  salaryAmount: number
  advanceAmount: number
}

/**
 * Students' monthly fees for the months the range touches (fees are per month,
 * so "today" shows the whole current month here).
 */
export interface StatsBilling {
  amountDue: number
  amountPaid: number
  pendingAmount: number
  /** Still to collect: due − paid − pending, per row, ≥ 0. */
  collectableAmount: number
  totalCount: number
  paidCount: number
  pendingCount: number
  partialCount: number
  unpaidCount: number
  debtorsCount: number
}

export interface StatsStudents {
  /** Studying now (not tied to the range). */
  active: number
  started: number
  registered: number
  stopped: number
}

/** GET /statistics/overview (verified against the live API). */
export interface StatsOverviewResponse {
  centerId: number | null
  fromDate: string
  toDate: string
  /** `YYYY-MM` — the months the billing block covers. */
  billingFromMonth: string
  billingToMonth: string
  /** Confirmed receipts — cash that came in, by the day it was paid. */
  income: StatsIncome
  /** Taken by reception, not confirmed by an admin yet. */
  pending: StatsAmountCount
  refunds: StatsAmountCount
  expenses: StatsAmountCount
  /** Salary payments + advances handed out in the range. */
  salaries: StatsSalaries
  /** income − refunds − expenses − salaries. */
  balance: number
  billing: StatsBilling
  students: StatsStudents
}
