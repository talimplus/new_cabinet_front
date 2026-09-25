/** Body for POST /students/transfer/preview. */
export interface TransferPreviewForm {
  studentIds: number[]
  fromGroupId: number
}

/** POST /students/transfer/preview returns a BARE ARRAY of these. */
export interface TransferPreviewRow {
  studentId: number
  firstName: string
  lastName: string
  /** Owed in the source group — never blocks the transfer, it just stays there. */
  debt: number
  /** Overpaid in the source group — carried over to the new group. */
  overpaid: number
}

/** Body for POST /students/transfer. */
export interface TransferForm {
  studentIds: number[]
  fromGroupId: number
  toGroupId: number
  /** `YYYY-MM-DD`; the backend defaults to today when omitted. */
  transferDate?: string
  reason?: string
  /** Closes the source group afterwards (last students left it). */
  closeSourceGroup?: boolean
}

export interface TransferResultRow {
  studentId: number
  firstName: string
  lastName: string
  carriedOverAmount: number
  refundedAmount: number
  remainingDebtInSourceGroup: number
}

export interface TransferResponse {
  fromGroupId: number
  toGroupId: number
  transferDate: string
  sourceGroupClosed: boolean
  transferred: number
  results: TransferResultRow[]
}
