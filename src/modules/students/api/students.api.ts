import { http } from '@/shared/api/http'
import type { Student, StudentDetail } from '../interfaces/student.interface'
import type { StudentForm } from '../interfaces/student-form.interface'
import type { StudentsParams } from '../interfaces/student-params.interface'
import type { DeleteStudentResponse } from '../interfaces/student-delete.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type { StudentStatus } from '../enums/student-status.enum'
import type { ReturnLikelihood } from '../enums/return-likelihood.enum'

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

/** PUT /students/change-status/:id?status=X — status is a required query param. */
export async function changeStudentStatus(
  id: number,
  status: StudentStatus,
  body?: { returnLikelihood?: ReturnLikelihood; comment?: string },
): Promise<void> {
  await http.put(`/students/change-status/${id}`, body ?? {}, { params: { status } })
}
