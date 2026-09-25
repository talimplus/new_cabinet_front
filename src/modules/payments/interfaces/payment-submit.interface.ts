import type { PaymentReceptionForm } from '@/shared/interfaces/payment-reception.interface'
import type { ExclusionForm } from './payment-exclusion.interface'

/**
 * What the payment dialogs hand back on confirm. They own the reception fields
 * and the optional write-off; the composable turns them into API calls
 * (apply-exclusion first, then the money endpoint).
 */
export interface MarkAsPaidSubmit {
  exclusion: ExclusionForm | null
  reception: PaymentReceptionForm
}

export interface PartialSubmit extends MarkAsPaidSubmit {
  amount: number
}
