export enum PayrollStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
}

export const PAYROLL_STATUS_LABEL_KEYS: Record<PayrollStatus, string> = {
  [PayrollStatus.PAID]: 'payroll.status.paid',
  [PayrollStatus.UNPAID]: 'payroll.status.unpaid',
  [PayrollStatus.PARTIAL]: 'payroll.status.partial',
}

export const PAYROLL_STATUS_VARIANTS: Record<
  PayrollStatus,
  'success' | 'warning' | 'danger'
> = {
  [PayrollStatus.PAID]: 'success',
  [PayrollStatus.UNPAID]: 'danger',
  [PayrollStatus.PARTIAL]: 'warning',
}
