/**
 * Body for PUT /payments/preview-exclusion/{id} and apply-exclusion.
 * Exactly one of `excludeLessons` / `excludeAmount` is sent; `comment` is
 * mandatory on apply (it is the written-off reason) and unused on preview.
 */
export interface ExclusionForm {
  excludeLessons?: number
  excludeAmount?: number
  comment?: string
}

/** PUT /payments/preview-exclusion/{id} — computed live, nothing is stored. */
export interface ExclusionPreviewResponse {
  paymentId: number
  forMonth: string
  lessonsPlanned: number
  lessonsBillable: number
  perLessonAmount: number
  baseAmountDue: number
  currentAmountDue: number
  amountPaid: number
  excludeLessons?: number
  excludeAmount?: number
  excludedAmount: number
  newAmountDue: number
  /** Cash-desk debt after the write-off — pendingAmount is NOT subtracted. */
  newRemaining: number
}

/** What `PaymentExclusionCard` reports up to the dialog holding it. */
export interface ExclusionState {
  /** A write-off has actually been entered (value > 0). */
  active: boolean
  /** Ready-to-send apply body, or null while nothing is entered. */
  form: ExclusionForm | null
  preview: ExclusionPreviewResponse | null
  /** The mandatory reason is filled in. */
  valid: boolean
  previewing: boolean
}

export function emptyExclusionState(): ExclusionState {
  return { active: false, form: null, preview: null, valid: true, previewing: false }
}
