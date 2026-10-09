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
  subjectId: number | null
  address: string | null
  comment: string | null
}
