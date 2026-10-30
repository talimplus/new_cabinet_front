/**
 * Response of the two backdating previews (docs/01-api-integration.md §5.7 "Backdating"):
 * `POST /groups/:id/start-date/preview` and `POST /students/:id/start-date/preview`.
 * Nothing is written — the dialog shows this before the user confirms.
 */

/** One payment row that changes (or gets created). */
export interface BackdatePreviewRow {
  studentId: number
  studentName: string
  groupId: number
  groupName: string
  /** `YYYY-MM-01` */
  forMonth: string
  /** No row yet — it will be created. */
  isNew: boolean
  currentDue: number
  newDue: number
  amountPaid: number
  /** Paid money above the new due — goes to `refundedAmount`. */
  refund: number
}

export interface BackdateTotals {
  debtIncrease: number
  debtDecrease: number
  refund: number
}

/** A month whose teacher salary is already paid — late money becomes carryover. */
export interface BackdatePaidSalaryMonth {
  teacherId: number
  teacherName: string
  forMonth: string
}

export interface BackdatePreview {
  rows: BackdatePreviewRow[]
  totals: BackdateTotals
  paidSalaryMonths: BackdatePaidSalaryMonth[]
}
