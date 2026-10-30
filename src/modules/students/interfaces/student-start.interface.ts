import type { ReturnLikelihood } from '../enums/return-likelihood.enum'
import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

/** Body of `PUT /students/change-status/:id`. */
export interface StudentStatusChangeForm {
  returnLikelihood?: ReturnLikelihood
  comment?: string
  /** `YYYY-MM-DD`, first activation only — the day the student really started. */
  startDate?: string
}

/** `POST /students/:id/start-date/preview` body. */
export interface StudentStartPreviewForm {
  startDate: string
  /** Groups being ADDED in an edit. Omitted → first activation (all current groups). */
  groupIds?: number[]
}

export interface StudentStartPreview extends BackdatePreview {
  startDate: string
}
