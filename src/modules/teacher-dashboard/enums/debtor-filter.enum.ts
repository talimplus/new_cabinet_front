/** Debtors list tabs on the teacher dashboard. */
export enum DebtorFilter {
  /** Anyone with an unpaid balance up to the chosen month. */
  ALL = 'all',
  /** Nothing paid for the chosen month. */
  UNPAID = 'unpaid',
  /** Part of the chosen month paid. */
  PARTIAL = 'partial',
}

export const DEBTOR_FILTER_LABEL_KEYS: Record<DebtorFilter, string> = {
  [DebtorFilter.ALL]: 'teacherDashboard.debtors.all',
  [DebtorFilter.UNPAID]: 'teacherDashboard.debtors.unpaid',
  [DebtorFilter.PARTIAL]: 'teacherDashboard.debtors.partial',
}
