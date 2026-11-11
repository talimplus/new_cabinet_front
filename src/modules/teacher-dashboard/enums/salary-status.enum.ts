/** `staff_salaries.status` — how much of the month's salary is handed over. */
export enum SalaryStatus {
  PAID = 'paid',
  PARTIAL = 'partial',
  UNPAID = 'unpaid',
}

export const SALARY_STATUS_LABEL_KEYS: Record<SalaryStatus, string> = {
  [SalaryStatus.PAID]: 'teacherDashboard.salary.status.paid',
  [SalaryStatus.PARTIAL]: 'teacherDashboard.salary.status.partial',
  [SalaryStatus.UNPAID]: 'teacherDashboard.salary.status.unpaid',
}

export const SALARY_STATUS_VARIANTS: Record<SalaryStatus, 'success' | 'warning' | 'danger'> = {
  [SalaryStatus.PAID]: 'success',
  [SalaryStatus.PARTIAL]: 'warning',
  [SalaryStatus.UNPAID]: 'danger',
}
