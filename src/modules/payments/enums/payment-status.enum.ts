export enum PaymentStatus {
  UNPAID = 'unpaid',
  PARTIAL = 'partial',
  PAID = 'paid',
}

export const PAYMENT_STATUS_LABEL_KEYS: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'payments.status.unpaid',
  [PaymentStatus.PARTIAL]: 'payments.status.partial',
  [PaymentStatus.PAID]: 'payments.status.paid',
}

export const PAYMENT_STATUS_VARIANTS: Record<
  PaymentStatus,
  'success' | 'warning' | 'danger'
> = {
  [PaymentStatus.UNPAID]: 'danger',
  [PaymentStatus.PARTIAL]: 'warning',
  [PaymentStatus.PAID]: 'success',
}
