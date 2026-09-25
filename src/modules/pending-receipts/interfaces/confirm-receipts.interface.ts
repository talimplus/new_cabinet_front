/**
 * Body for PUT /payments/confirm-receipts. Either `receiptIds` **or**
 * `all: true` (plus the same filters the list used) must be present — the
 * backend answers 400 otherwise, deliberately, so nobody confirms everything
 * by accident.
 */
export interface ConfirmReceiptsForm {
  receiptIds?: number[]
  all?: boolean
  centerId?: number
  dateFrom?: string
  dateTo?: string
}

export interface ConfirmedReceiptResult {
  receiptId: number
  amount: number
  checkNo: string
}

/** One failure does not stop the rest — the response reports each bucket. */
export interface ConfirmReceiptsResponse {
  requested: number
  confirmedCount: number
  confirmedAmount: number
  skippedCount: number
  failedCount: number
  confirmed: ConfirmedReceiptResult[]
  /** Already confirmed/rejected, or belonging to another center. */
  skipped: number[]
  failed: unknown[]
}
