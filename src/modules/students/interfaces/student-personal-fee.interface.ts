import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'
import type { OverpaymentMode } from '../enums/overpayment-mode.enum'

/** `POST /students/:id/personal-fee/clear/preview` body — omitted date → `defaultFromDate`. */
export interface PersonalFeePreviewForm {
  /** The group whose personal price is dropped (each group has its own). */
  groupId: number
  /** `YYYY-MM-DD` */
  fromDate?: string
}

/** `POST /students/:id/personal-fee/clear` body. */
export interface PersonalFeeClearForm {
  groupId: number
  /** `YYYY-MM-DD` — lessons from this day are billed by the group price; earlier ones keep the old price. */
  fromDate: string
  /** Money paid above the new amount: given back or moved to the next months (default refund). */
  overpayment?: OverpaymentMode
}

/** The payment impact of dropping the personal price in one group (writes nothing). */
export interface PersonalFeePreview extends BackdatePreview {
  groupId: number
  groupName: string
  /** `YYYY-MM-DD` the preview was computed for. */
  fromDate: string
  /** `YYYY-MM-DD` — the day the student was activated (bounded by `minDate`). */
  defaultFromDate: string
  /** `YYYY-MM-DD` — the earliest day that can be picked (24 months back). */
  minDate: string
  /** The personal price in that group at `fromDate`. */
  personalFee: number
}

export interface PersonalFeeClearResponse {
  studentId: number
  groupId: number
  fromDate: string
  overpayment: OverpaymentMode
  /** Paid above the new amounts in total. */
  overpaidAmount: number
  /** Of it — to be given back (`refundedAmount`). */
  refundedAmount: number
  /** Of it — moved toward the next months. */
  carriedAmount: number
  /** Of the carried — already paid into an existing next month. */
  appliedAmount: number
  /** Student-wide carried money still waiting for its month to open. */
  waitingAmount: number
}
