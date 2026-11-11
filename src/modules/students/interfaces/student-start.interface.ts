import type { ReturnLikelihood } from '../enums/return-likelihood.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

/** Body of `PUT /students/change-status/:id`. */
export interface StudentStatusChangeForm {
  returnLikelihood?: ReturnLikelihood
  comment?: string
  /** `YYYY-MM-DD`, first activation only — the day the student really started. */
  startDate?: string
  /**
   * `YYYY-MM-DD`, STOPPED only — the day the student stopped (exclusive: lessons
   * from it are not billed). Past allowed; 422 `stopDate` when a lesson after it
   * is marked present/late. Omitted → today.
   */
  stopDate?: string
  /**
   * `YYYY-MM-DD`, return only (stopped/finished → active) — the day the student
   * studies again. Not before `StudentReactivation.statusChangedOn` (picking it
   * undoes a mistaken status with no gap), not after today. Omitted → today.
   */
  returnDate?: string
  /** Return only: also add the student to this running group (required when none is left). */
  groupId?: number
}

/** One of the student's groups, as GET /students/:id/reactivation lists it. */
export interface StudentReactivationGroup {
  id: number
  name: string
  /** A closed group — the student does not continue there. */
  finished: boolean
}

/** GET /students/:id/reactivation — date bounds for the return dialog. */
export interface StudentReactivation {
  status: StudentStatus
  /** `YYYY-MM-DD` the current status was set — default and earliest pick; null when unknown. */
  statusChangedOn: string | null
  /** `YYYY-MM-DD` in the group's time zone — the latest pick. */
  today: string
  groups: StudentReactivationGroup[]
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
