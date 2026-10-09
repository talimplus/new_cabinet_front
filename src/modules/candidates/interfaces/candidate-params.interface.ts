/** GET /candidates params. `centerId` is appended by the http interceptor. */
export interface CandidatesParams {
  /** Matches first name, last name or phone (digits are compared as digits). */
  search?: string
  subjectId?: number
  page?: number
  perPage?: number
}
