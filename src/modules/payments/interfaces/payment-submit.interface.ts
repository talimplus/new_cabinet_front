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
  /**
   * The write-off alone closes the month — nothing is left to collect, so only
   * apply-exclusion is sent (the backend rejects a zero / already-paid payment).
   */
  writeOffOnly?: boolean
}

export interface PartialSubmit extends MarkAsPaidSubmit {
  amount: number
}
