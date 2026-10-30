import type { StudentStatus } from '@/modules/students/enums/student-status.enum'
import type { BackdatePreview } from '@/shared/interfaces/backdate-preview.interface'

/** Extra body of `PUT /groups/change-status/:id` when starting a group. */
export interface GroupStartForm {
  /** `YYYY-MM-DD` — the day lessons really began (may be in the past, never ahead). */
  startDate?: string
  /** Members whose join date moves back to `startDate` too. Omitted → all candidates. */
  backdateStudentIds?: number[]
}

/** `POST /groups/:id/start-date/preview` body. */
export interface GroupStartPreviewForm {
  startDate: string
  /** Omitted → all candidates; `[]` → nobody. */
  backdateStudentIds?: number[]
}

/** A member who joined after the new start date (never a transferred-in one). */
export interface GroupStartCandidate {
  studentId: number
  fullName: string
  status: StudentStatus
  /** `YYYY-MM-DD` — the current join date. */
  joinedAt: string
}

export interface GroupStartPreview extends BackdatePreview {
  startDate: string
  prevStartDate: string
  /** Attendance recorded before `startDate` — the change is refused (422) while > 0. */
  attendanceBefore: number
  candidates: GroupStartCandidate[]
}
