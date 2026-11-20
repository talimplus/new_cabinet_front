import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'
import type { OverpaymentMode } from '../enums/overpayment-mode.enum'

/** `POST /students/:id/personal-fee/clear/preview` body — omitted month → `defaultFromMonth`. */
export interface PersonalFeePreviewForm {
  /** The group whose personal price is dropped (each group has its own). */
  groupId: number
  /** `YYYY-MM-01` */
  fromMonth?: string
}

/** `POST /students/:id/personal-fee/clear` body. */
export interface PersonalFeeClearForm {
  groupId: number
  /** `YYYY-MM-01` — from this month the group price applies; earlier months keep the old price. */
  fromMonth: string
  /** Money paid above the new amount: given back or moved to the next months (default refund). */
  overpayment?: OverpaymentMode
}

/** The payment impact of dropping the personal price in one group (writes nothing). */
export interface PersonalFeePreview extends BackdatePreview {
  groupId: number
  groupName: string
  /** `YYYY-MM-01` the preview was computed for. */
  fromMonth: string
  /** `YYYY-MM-01` — the month the student was activated (bounded by `minMonth`). */
  defaultFromMonth: string
  /** `YYYY-MM-01` — the earliest month that can be picked (24 months back). */
  minMonth: string
  /** The personal price in that group at `fromMonth`. */
  personalFee: number
}

export interface PersonalFeeClearResponse {
  studentId: number
  groupId: number
  fromMonth: string
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
