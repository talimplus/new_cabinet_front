/** How the money reached the center. Backend value set (`payment_receipts.paymentMethod`). */
export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  ONLINE = 'online',
}

export const PAYMENT_METHOD_LABEL_KEYS: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH]: 'payments.reception.method.cash',
  [PaymentMethod.CARD]: 'payments.reception.method.card',
  [PaymentMethod.BANK_TRANSFER]: 'payments.reception.method.bank_transfer',
  [PaymentMethod.ONLINE]: 'payments.reception.method.online',
}
