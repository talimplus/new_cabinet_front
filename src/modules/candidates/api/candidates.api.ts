import { http } from '@/shared/api/http'
import type { Candidate } from '../interfaces/candidate.interface'
import type { CandidateForm } from '../interfaces/candidate-form.interface'
import type { CandidatesParams } from '../interfaces/candidate-params.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export async function fetchCandidates(params: CandidatesParams): Promise<PaginatedResponse<Candidate>> {
  const { data } = await http.get<PaginatedResponse<Candidate>>('/candidates', { params })
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
