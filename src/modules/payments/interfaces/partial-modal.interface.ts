import type { Payment } from './payment.interface'
import type { PaymentCalculationResponse } from './payment-calculation.interface'

/** Props of `PartialPaymentModal` — the recalculation state lives in the page. */
export interface PartialModalProps {
  open: boolean
  payment: Payment | null
  calculation: PaymentCalculationResponse | null
  date: Date | null
  calculating?: boolean
  loading?: boolean
}
