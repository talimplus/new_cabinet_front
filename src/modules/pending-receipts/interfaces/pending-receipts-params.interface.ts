import type { PendingReceipt } from './pending-receipt.interface'
import type { PaginationMeta } from '@/shared/interfaces/paginated.interface'

/**
 * Query params shared by GET /payments/pending-receipts and
 * GET /payments/receipts-stats — so the cards always describe exactly the rows
 * the table shows. The dates filter on when the money was TAKEN (`receivedAt`,
 * falling back to `createdAt`); both bounds are optional.
 */
export interface PendingReceiptsParams {
  centerId?: number
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}

export interface PendingReceiptsMeta extends PaginationMeta {
  /** Sum of EVERY matching pending receipt, not just this page. */
  totalAmount?: number
}

export interface PendingReceiptsResponse {
  data: PendingReceipt[]
  meta: PendingReceiptsMeta
}
