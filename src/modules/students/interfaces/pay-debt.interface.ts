import type { PaymentMethod } from '@/shared/enums/payment-method.enum'

/**
 * Body for PUT /payments/pay-debt/student/{studentId}. The backend spreads
 * `amount` over the open months **oldest first**; omitting it pays everything.
 */
export interface PayDebtForm {
  amount?: number
  comment?: string
  paymentMethod?: PaymentMethod
  /** `YYYY-MM-DD`, only meaningful for a CARD payment. */
  paidAt?: string
}

/** One row of the client-side "how will this amount be split" preview. */
export interface DebtAllocation {
  forMonth: string
  groupName: string
  allocated: number
}
