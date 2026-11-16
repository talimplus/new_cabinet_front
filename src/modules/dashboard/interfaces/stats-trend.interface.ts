import type { TrendMonths } from '../enums/trend-months.enum'

export interface StatsTrendParams {
  months: TrendMonths
}

export interface StatsTrendPoint {
  /** `YYYY-MM` */
  month: string
  /** Cash that came in during the month (confirmed receipts). */
  income: number
  /** What students had to pay for the month. */
  charged: number
  /** Students who studied at least one day of the month. */
  students: number
  started: number
  stopped: number
}

/** GET /statistics/trend (verified against the live API). */
export interface StatsTrendResponse {
  centerId: number | null
  months: number
  points: StatsTrendPoint[]
}
