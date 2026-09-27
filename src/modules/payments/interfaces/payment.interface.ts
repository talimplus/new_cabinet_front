import type { PaymentStatus } from '../enums/payment-status.enum'

export interface PaymentStudent {
  firstName: string
  lastName: string
}

export interface PaymentGroup {
  name: string
}

/**
 * A row from GET /payments.
 *
 * ⚠️ The DECIMAL columns arrive as strings (`"138461.54"`), while the computed
 * fields (`remainingAmount`, `payableNow`, …) arrive as real numbers — verified
 * against the dev backend. Everything typed `number | string` here is display
 * only; arithmetic uses the numeric fields.
 */
export interface Payment {
  id: number
  student: PaymentStudent
  group: PaymentGroup | null
  amountDue: number | string
  amountPaid: number | string
  remainingAmount: number
  status: PaymentStatus
  forMonth: string
  dueDate: string
  hardDueDate: string
  isOverdue: boolean
  lessonsPlanned: number
  lessonsBillable: number
  lessonsExcused?: number
  refundedAmount?: number
  /** Manually written off by an admin, with the mandatory reason. */
  manualExcludedAmount?: number | string
  manualExcludedReason?: string | null
  /** Discount percent applied to this month's fee. */
  discountPercentApplied?: number
  /**
   * Fixed discount (so'm/month). A discount not tied to a subject is taken
   * ONCE from the student's total — it shows on the main group's row only.
   */
  discountAmountApplied?: number
  createdAt: string
  hasPendingReceipt?: boolean
  pendingReceiptsCount?: number
  /** Taken by reception but not yet confirmed by an admin. */
  pendingAmount?: number
  /** amountPaid + pendingAmount — what the student actually handed over. */
  receivedAmount?: number
  /** amountDue − receivedAmount — what is still collectable from the student. */
  payableNow?: number
  /**
   * Only GET /payments/student/{id}/summary fills these; the list leaves them
   * undefined, so every use site must stay optional.
   */
  perLessonAmount?: number
  fullAmount?: number
  isProrated?: boolean
}
