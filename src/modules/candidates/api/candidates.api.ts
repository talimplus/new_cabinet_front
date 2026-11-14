import { http } from '@/shared/api/http'
import type { Candidate } from '../interfaces/candidate.interface'
import type { CandidateForm, CandidateHireForm, CandidateStatusForm } from '../interfaces/candidate-form.interface'
import type { CandidatesParams } from '../interfaces/candidate-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchCandidates(params: CandidatesParams): Promise<PaginatedResponse<Candidate>> {
  const { data } = await http.get<PaginatedResponse<Candidate>>('/candidates', { params })
  return data
}

/** GET /candidates/:id — the same shape as a list row. */
export async function fetchCandidate(id: number): Promise<Candidate> {
  const { data } = await http.get<Candidate>(`/candidates/${id}`)
  return data
}

export async function createCandidate(form: CandidateForm): Promise<Candidate> {
  const { data } = await http.post<Candidate>('/candidates', form)
  return data
}

export async function updateCandidate(id: number, form: CandidateForm): Promise<Candidate> {
  const { data } = await http.put<Candidate>(`/candidates/${id}`, form)
  return data
}

export async function deleteCandidate(id: number): Promise<void> {
  await http.delete(`/candidates/${id}`)
}

/** PUT /candidates/:id/status — new / hired / 50-50 / rejected. */
export async function changeCandidateStatus(id: number, form: CandidateStatusForm): Promise<Candidate> {
  const { data } = await http.put<Candidate>(`/candidates/${id}/status`, form)
  return data
}

/**
 * POST /candidates/:id/hire — creates the employee and marks the candidate
 * hired (`hiredUserId`). Needs `users.create` too; a taken login/phone is a 422.
 */
export async function hireCandidate(id: number, form: CandidateHireForm): Promise<Candidate> {
  const { data } = await http.post<Candidate>(`/candidates/${id}/hire`, form)
  return data
}
