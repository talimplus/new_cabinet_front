import type { PaymentReceptionForm } from '@/shared/interfaces/payment-reception.interface'

/** Body for PUT /payments/mark-as-paid/{id} (all optional). */
export interface MarkAsPaidForm extends PaymentReceptionForm {}

/** Body for PUT /payments/pay-partial/{id}. */
export interface PayPartialForm extends PaymentReceptionForm {
  amount: number
}

/** Body for PUT /payments/calculate/{id}. */
export interface PaymentCalculateForm {
  plannedStudyUntilDate: string
}

/** Body for PUT /payments/{id}. */
export interface UpdatePaymentForm {
  plannedStudyUntilDate?: string
}
