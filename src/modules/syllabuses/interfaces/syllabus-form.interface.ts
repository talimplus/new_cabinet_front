/**
 * Create/update body for `POST /syllabuses` and `PUT /syllabuses/{id}`.
 * No `centerId` — the backend derives the center from the subject.
 */
export interface SyllabusForm {
  name: string
  description?: string
  subjectId?: number
}
