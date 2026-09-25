export enum ReceiptStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const RECEIPT_STATUS_LABEL_KEYS: Record<ReceiptStatus, string> = {
  [ReceiptStatus.PENDING]: 'payments.history.status.pending',
  [ReceiptStatus.CONFIRMED]: 'payments.history.status.confirmed',
  [ReceiptStatus.REJECTED]: 'payments.history.status.rejected',
}

export const RECEIPT_STATUS_VARIANTS: Record<ReceiptStatus, 'warning' | 'success' | 'danger'> = {
  [ReceiptStatus.PENDING]: 'warning',
  [ReceiptStatus.CONFIRMED]: 'success',
  [ReceiptStatus.REJECTED]: 'danger',
}
