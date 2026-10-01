import type { StudentStatus } from '../enums/student-status.enum'

/** `DELETE /students/:id` → `200 { success: true }`. */
export interface DeleteStudentResponse {
  success: boolean
}

/** The bits of a student the delete flow needs — both the list row and the card profile fit. */
export interface DeletableStudent {
  id: number
  firstName: string
  lastName: string
  status: StudentStatus
}
