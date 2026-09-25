import type { PaymentMethod } from '@/shared/enums/payment-method.enum'

/**
 * "How was the money handed over" — the fields every money-taking endpoint
 * accepts (`mark-as-paid`, `pay-partial`, `pay-debt`). Shared because the
 * payments page and the student card both collect them.
 */
export interface PaymentReceptionForm {
  paymentMethod?: PaymentMethod
  /** `YYYY-MM-DD`, only meaningful when `paymentMethod` is CARD. */
  paidAt?: string
  comment?: string
}
