import type { PaymentMethod } from '@/shared/enums/payment-method.enum'
import type { ReceiptStatus } from '@/shared/enums/receipt-status.enum'

/** Related records the backend may return as `null` on an older receipt. */
export interface CheckStudent {
  fullName?: string | null
  phone?: string | null
}
export interface CheckNamed {
  fullName?: string | null
}
export interface CheckGroup {
  name?: string | null
}

/**
 * The printable receipt returned by mark-as-paid / pay-partial,
 * GET /payments/{id}/receipts and GET /payments/receipt/{id}/check.
 */
export interface PaymentCheck {
  /** Lets the check be re-fetched later; absent on very old receipts. */
  receiptId?: number
  /** "1" | "1-A" | "1-A-B" — printed large at the top. */
  checkNo: string
  transactionNo?: string
  invoiceNo?: number
  installmentIndex?: number
  status: ReceiptStatus
  student: CheckStudent | null
  group: CheckGroup | null
  teacher: CheckNamed | null
  /** "2026-09". */
  forMonth?: string | null
  amount: number
  balanceBefore?: number | null
  balanceAfter?: number | null
  paymentMethod?: PaymentMethod | null
  /** Card payment date, when one was entered. */
  paidAt?: string | null
  receivedAt?: string | null
  createdAt?: string | null
  receivedBy: CheckNamed | null
  comment?: string | null
}

/** mark-as-paid / pay-partial response — the check rides along. */
export interface PaymentActionResponse {
  check?: PaymentCheck
}

/** GET /payments/{paymentId}/receipts. */
export interface PaymentReceiptsResponse {
  data: PaymentCheck[]
}
