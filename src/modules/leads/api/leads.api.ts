import { http } from '@/shared/api/http'
import type { Lead } from '../interfaces/lead.interface'
import type { LeadForm } from '../interfaces/lead-form.interface'
import type { LeadsParams } from '../interfaces/lead-params.interface'
import type { LeadTransferForm } from '../interfaces/lead-transfer-form.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type { LeadStatus } from '../enums/lead-status.enum'

export async function fetchLeads(params: LeadsParams): Promise<PaginatedResponse<Lead>> {
  const { data } = await http.get<PaginatedResponse<Lead>>('/leads', { params })
  return data
}

export async function createLead(form: LeadForm): Promise<Lead> {
  const { data } = await http.post<Lead>('/leads', form)
  return data
}

export async function updateLead(id: number, form: LeadForm): Promise<Lead> {
  const { data } = await http.put<Lead>(`/leads/${id}`, form)
  return data
}

export async function deleteLead(id: number): Promise<void> {
  await http.delete(`/leads/${id}`)
}

/** PUT /leads/change-status/:id with { status, reason? } body (no response body). */
export async function changeLeadStatus(
  id: number,
  status: LeadStatus,
  reason?: string,
): Promise<void> {
  await http.put(`/leads/change-status/${id}`, { status, ...(reason ? { reason } : {}) })
}

/** POST /leads/:id/transfer-to-student — creates and returns a Student ({ id }). */
export async function transferLeadToStudent(
  id: number,
  form: LeadTransferForm,
): Promise<{ id: number }> {
  const { data } = await http.post<{ id: number }>(`/leads/${id}/transfer-to-student`, form)
  return data
}
