import { http } from '@/shared/api/http'
import type { Subject } from '../interfaces/subject.interface'
import type { SubjectForm } from '../interfaces/subject-form.interface'
import type { SubjectsParams } from '../interfaces/subject-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchSubjects(params: SubjectsParams): Promise<PaginatedResponse<Subject>> {
  const { data } = await http.get<PaginatedResponse<Subject>>('/subjects', { params })
  return data
}

export async function createSubject(form: SubjectForm): Promise<Subject> {
  const { data } = await http.post<Subject>('/subjects', form)
  return data
}

export async function updateSubject(id: number, form: SubjectForm): Promise<Subject> {
  const { data } = await http.put<Subject>(`/subjects/${id}`, form)
  return data
}

export async function deleteSubject(id: number): Promise<void> {
  await http.delete(`/subjects/${id}`)
}
