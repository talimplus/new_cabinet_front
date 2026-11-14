import type { CandidatePosition } from '../enums/candidate-position.enum'
import type { CandidateStatus } from '../enums/candidate-status.enum'

/**
 * POST /candidates and PUT /candidates/:id body. The optional fields send
 * `null` to clear a value; `centerId` is the header's active center.
 */
export interface CandidateForm {
  centerId: number
  lastName: string
  firstName: string
  phone: string
  experience: string
  birthYear: number
  position: CandidatePosition
  subjectId: number | null
  address: string | null
  comment: string | null
}

/** PUT /candidates/:id/status body. */
export interface CandidateStatusForm {
  status: CandidateStatus
}

/**
 * POST /candidates/:id/hire body — turns the candidate into an employee. Name,
 * phone and center come from the candidate (sent again in case they were
 * corrected); login, password and role are what a candidate never has.
 */
export interface CandidateHireForm {
  firstName: string
  lastName: string
  phone: string
  login: string
  password: string
  roleId: number
  salary?: number
  commissionPercentage?: number
}
