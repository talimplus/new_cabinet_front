import type { CandidatePosition } from '../enums/candidate-position.enum'
import type { CandidateStatus } from '../enums/candidate-status.enum'

/** GET /candidates params. `centerId` is appended by the http interceptor. */
export interface CandidatesParams {
  /** Matches first name, last name or phone (digits are compared as digits). */
  search?: string
  subjectId?: number
  position?: CandidatePosition
  status?: CandidateStatus
  page?: number
  perPage?: number
}
