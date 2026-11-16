/** `status` of GET /statistics/details/income (backend-exact values). */
export enum StatsIncomeStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
}

export const STATS_INCOME_STATUS_LABEL_KEYS: Record<StatsIncomeStatus, string> = {
  [StatsIncomeStatus.CONFIRMED]: 'statistics.detail.income.confirmed',
  [StatsIncomeStatus.PENDING]: 'statistics.detail.income.pending',
}
