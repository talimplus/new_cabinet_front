import type { ReturnLikelihood } from '../enums/return-likelihood.enum'

/** Body of `POST /students/:id/leave-group`. */
export interface StudentLeaveGroupForm {
  groupId: number
  /** `YYYY-MM-DD`, exclusive: lessons from it are not billed. Omitted → today. */
  stopDate?: string
  /** Required only when it is the student's last unfinished group (→ stopped). */
  returnLikelihood?: ReturnLikelihood
  reason?: string
}

/** Response of `POST /students/:id/leave-group`. */
export interface StudentLeaveGroupResponse {
  studentId: number
  groupId: number
  stopDate: string
  studentStopped: boolean
  /** Money this leave released: it goes back to the student in cash. */
  refundedAmount: number
  /** Unpaid total of this group (all months); it stays with the group. */
  remainingDebt: number
}
