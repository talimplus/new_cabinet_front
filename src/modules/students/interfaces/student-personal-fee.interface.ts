import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

/** `POST /students/:id/personal-fee/clear/preview` body — omitted month → `defaultFromMonth`. */
export interface PersonalFeePreviewForm {
  /** `YYYY-MM-01` */
  fromMonth?: string
}

/** `POST /students/:id/personal-fee/clear` body. */
export interface PersonalFeeClearForm {
  /** `YYYY-MM-01` — from this month the group price applies; earlier months keep the old price. */
  fromMonth: string
}

/** The payment impact of dropping the personal price (writes nothing). */
export interface PersonalFeePreview extends BackdatePreview {
  /** `YYYY-MM-01` the preview was computed for. */
  fromMonth: string
  /** `YYYY-MM-01` — the month the student was activated (bounded by `minMonth`). */
  defaultFromMonth: string
  /** `YYYY-MM-01` — the earliest month that can be picked (24 months back). */
  minMonth: string
  /** The personal price stored now. */
  personalFee: number
}

export interface PersonalFeeClearResponse {
  studentId: number
  fromMonth: string
}
