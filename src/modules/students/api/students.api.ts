import { http } from '@/shared/api/http'
import type {
  StudentLeaveGroupForm,
  StudentLeaveGroupResponse,
} from '../interfaces/student-leave-group.interface'
import type { Student, StudentDetail } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import type { StudentsParams } from '../interfaces/student-params.interface'
import type { DeleteStudentResponse } from '../interfaces/student-delete.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type { StudentStatus } from '../enums/student-status.enum'
import type {
  StudentStartPreview,
  StudentStartPreviewForm,
  StudentStatusChangeForm,
  StudentReactivation,
} from '../interfaces/student-start.interface'

export async function fetchStudents(params: StudentsParams): Promise<PaginatedResponse<Student>> {
  const { data } = await http.get<PaginatedResponse<Student>>('/students', { params })
  return data
}

/**
 * GET /students/{id} — the editable record (groups as objects, discount
 * periods, passport fields). The student CARD reads its display data from
 * `fetchStudentPaymentSummary` instead; this is what feeds the edit form.
 */
export async function fetchStudentById(id: number): Promise<StudentDetail> {
  const { data } = await http.get<StudentDetail>(`/students/${id}`)
  return data
}

/** Full non-paginated list for a center (used for the "referred by" dropdown). */
export async function fetchAllStudents(centerId?: number): Promise<Student[]> {
  const { data } = await http.get<Student[]>('/students/all', { params: { centerId } })
  return data
}

export async function createStudent(form: StudentForm): Promise<Student> {
  const { data } = await http.post<Student>('/students', form)
  return data
}

export async function updateStudent(id: number, form: StudentForm): Promise<Student> {
  const { data } = await http.put<Student>(`/students/${id}`, form)
  return data
}

/**
 * DELETE /students/:id — irreversible. The backend only allows it for a NEW
 * student with no payment/attendance history; otherwise it answers 400 with a
 * message the http interceptor toasts.
 */
export async function deleteStudent(id: number): Promise<DeleteStudentResponse> {
  const { data } = await http.delete<DeleteStudentResponse>(`/students/${id}`)
  return data
}

/**
 * PUT /students/change-status/:id?status=X — status is a required query param.
 * `startDate` only on the FIRST activation (new/ignored → ACTIVE): the day the
 * student really started; billing begins on it.
 */
export async function changeStudentStatus(
  id: number,
  status: StudentStatus,
  body?: StudentStatusChangeForm,
): Promise<void> {
  await http.put(`/students/change-status/${id}`, body ?? {}, { params: { status } })
}

/** GET /students/:id/reactivation — when the status was set, today, and the groups. */
export async function fetchStudentReactivation(id: number): Promise<StudentReactivation> {
  const { data } = await http.get<StudentReactivation>(`/students/${id}/reactivation`)
  return data
}

/**
 * POST /students/:id/leave-group — the student stops studying in one group only:
 * billed up to `stopDate`, other groups untouched. Their last unfinished group
 * also stops the student (`returnLikelihood` required, else 422).
 */
export async function leaveStudentGroup(
  id: number,
  form: StudentLeaveGroupForm,
): Promise<StudentLeaveGroupResponse> {
  const { data } = await http.post<StudentLeaveGroupResponse>(`/students/${id}/leave-group`, form)
  return data
}

/** POST /students/:id/start-date/preview — the payment impact of a past start/join date; writes nothing. */
export async function previewStudentStartDate(
  id: number,
  form: StudentStartPreviewForm,
): Promise<StudentStartPreview> {
  const { data } = await http.post<StudentStartPreview>(`/students/${id}/start-date/preview`, form)
  return data
}
