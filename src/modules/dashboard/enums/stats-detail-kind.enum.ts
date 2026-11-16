/** Inner pages of the statistics page — the `:kind` route param. */
export enum StatsDetailKind {
  INCOME = 'income',
  EXPENSES = 'expenses',
  SALARIES = 'salaries',
  STUDENTS = 'students',
  DEBTS = 'debts',
}

export const STATS_DETAIL_TITLE_KEYS: Record<StatsDetailKind, string> = {
  [StatsDetailKind.INCOME]: 'statistics.detail.income.title',
  [StatsDetailKind.EXPENSES]: 'statistics.detail.expenses.title',
  [StatsDetailKind.SALARIES]: 'statistics.detail.salaries.title',
  [StatsDetailKind.STUDENTS]: 'statistics.detail.students.title',
  [StatsDetailKind.DEBTS]: 'statistics.detail.debts.title',
}

export const STATS_DETAIL_HINT_KEYS: Record<StatsDetailKind, string> = {
  [StatsDetailKind.INCOME]: 'statistics.detail.income.hint',
  [StatsDetailKind.EXPENSES]: 'statistics.detail.expenses.hint',
  [StatsDetailKind.SALARIES]: 'statistics.detail.salaries.hint',
  [StatsDetailKind.STUDENTS]: 'statistics.detail.students.hint',
  [StatsDetailKind.DEBTS]: 'statistics.detail.debts.hint',
}
