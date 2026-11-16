/** Tabs above the per-group student lists on the teacher dashboard. */
export enum StudentPayFilter {
  ALL = 'all',
  /** Anything unpaid up to the chosen month (older months too). */
  DEBT = 'debt',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PENDING = 'pending',
  PAID = 'paid',
}

export const STUDENT_PAY_FILTER_LABEL_KEYS: Record<StudentPayFilter, string> = {
  [StudentPayFilter.ALL]: 'teacherDashboard.list.tabs.all',
  [StudentPayFilter.DEBT]: 'teacherDashboard.list.tabs.debt',
  [StudentPayFilter.UNPAID]: 'teacherDashboard.list.tabs.unpaid',
  [StudentPayFilter.PARTIAL]: 'teacherDashboard.list.tabs.partial',
  [StudentPayFilter.PENDING]: 'teacherDashboard.list.tabs.pending',
  [StudentPayFilter.PAID]: 'teacherDashboard.list.tabs.paid',
}
