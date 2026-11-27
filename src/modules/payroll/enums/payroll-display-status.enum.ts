/**
 * What the owner reads in the status column. Derived from the money, not the
 * backend `status`: a salary covered only by an advance is "closed by
 * advance" (no money was handed over today), not "paid".
 */
export enum PayrollDisplayStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
  ADVANCE = 'advance',
  NONE = 'none',
}

export const PAYROLL_DISPLAY_LABEL_KEYS: Record<PayrollDisplayStatus, string> = {
  [PayrollDisplayStatus.UNPAID]: 'payroll.display.unpaid',
  [PayrollDisplayStatus.PARTIAL]: 'payroll.display.partial',
  [PayrollDisplayStatus.PAID]: 'payroll.display.paid',
  [PayrollDisplayStatus.ADVANCE]: 'payroll.display.advance',
  [PayrollDisplayStatus.NONE]: 'payroll.display.none',
}

export const PAYROLL_DISPLAY_VARIANTS: Record<
  PayrollDisplayStatus,
  'success' | 'warning' | 'danger' | 'info' | 'neutral'
> = {
  [PayrollDisplayStatus.UNPAID]: 'danger',
  [PayrollDisplayStatus.PARTIAL]: 'warning',
  [PayrollDisplayStatus.PAID]: 'success',
  [PayrollDisplayStatus.ADVANCE]: 'info',
  [PayrollDisplayStatus.NONE]: 'neutral',
}

/** Row tint — the same colour as the badge, softer. */
export const PAYROLL_DISPLAY_TINTS: Record<PayrollDisplayStatus, string> = {
  [PayrollDisplayStatus.UNPAID]: 'bg-danger-soft/40',
  [PayrollDisplayStatus.PARTIAL]: 'bg-warning-soft/40',
  [PayrollDisplayStatus.PAID]: 'bg-success-soft/30',
  [PayrollDisplayStatus.ADVANCE]: 'bg-info-soft/30',
  [PayrollDisplayStatus.NONE]: '',
}
