import type { ReceiptStatus } from '@/shared/enums/receipt-status.enum'

/** The `payment` object nested inside a pending receipt. */
export interface PendingReceiptPayment {
  id: number
  studentId: number
  groupId: number | null
  /** e.g. "2025-09" — render as MM.YYYY. */
  forMonth: string
  student: { firstName: string; lastName: string }
  group: { name: string } | null
}

/** GET /payments/pending-receipts entity. NOTE: `amount` is a string → parseFloat before formatting. */
export interface PendingReceipt {
  id: number
  paymentId: number
  amount: string
  receivedById: number
  /** Nullable in the backend entity — fall back to `createdAt` when absent. */
  receivedAt: string | null
  confirmedById: number | null
  confirmedAt: string | null
  status: ReceiptStatus
  comment: string | null
  createdAt: string
  payment: PendingReceiptPayment
}
