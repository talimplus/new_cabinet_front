import { http } from '@/shared/api/http'
import type { AbsencesParams } from '../interfaces/absence-params.interface'
import type { AbsenceFollowUpForm } from '../interfaces/absence-follow-up-form.interface'
import type {
  AbsenceFollowUpResponse,
  AbsencesResponse,
} from '../interfaces/absence.interface'

/** GET /attendance/absences — students who missed lessons, across all groups. */
export async function fetchAbsences(params: AbsencesParams): Promise<AbsencesResponse> {
  const { data } = await http.get<AbsencesResponse>('/attendance/absences', { params })
  return data
}

/** PUT /attendance/absences/{id}/follow-up — record the phone-call result. */
export async function saveAbsenceFollowUp(
  id: number,
  form: AbsenceFollowUpForm,
): Promise<AbsenceFollowUpResponse> {
  const { data } = await http.put<AbsenceFollowUpResponse>(
    `/attendance/absences/${id}/follow-up`,
    form,
  )
  return data
}
