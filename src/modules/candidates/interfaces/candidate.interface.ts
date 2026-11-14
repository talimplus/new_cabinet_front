import type { CandidatePosition } from '../enums/candidate-position.enum'
import type { CandidateStatus } from '../enums/candidate-status.enum'

/** The subject summary embedded in a candidate row. */
export interface CandidateSubject {
  id: number
  name: string
}

/**
 * A job candidate (HR) from GET /candidates and GET /candidates/:id — someone
 * who asked for a job or whom the center found. Not a staff member: no login.
 */
export interface Candidate {
  id: number
  centerId: number
  firstName: string
  lastName: string
  phone: string
  /** Free text, e.g. "3 yil, 21-maktab". */
  experience: string
  birthYear: number
  subjectId: number | null
  subject: CandidateSubject | null
  /** The job applied for; a subject exists only for teacher / assistant. */
  position: CandidatePosition
  status: CandidateStatus
  /** Set once the candidate was transferred to staff — the created employee's id. */
  hiredUserId: number | null
  address: string | null
  comment: string | null
  createdAt: string
  updatedAt: string
}
