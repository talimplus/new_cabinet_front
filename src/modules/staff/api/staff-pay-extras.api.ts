import { http } from '@/shared/api/http'
import type { StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type {
  StaffAdvanceForm,
  StaffBonusForm,
  StaffBonusRow,
  StaffExtraDeleteResponse,
} from '../interfaces/staff-pay-extras.interface'

/** POST /staff/advances → the advance as a deduction row (`type: 'advance'`). 400 past next month. */
export async function createStaffAdvance(form: StaffAdvanceForm): Promise<StaffDeductionRow> {
  const { data } = await http.post<StaffDeductionRow>('/staff/advances', form)
  return data
}

/** DELETE /staff/advances/{id} — undo a mistaken advance; salaries are recomputed. */
export async function deleteStaffAdvance(id: number): Promise<StaffExtraDeleteResponse> {
  const { data } = await http.delete<StaffExtraDeleteResponse>(`/staff/advances/${id}`)
  return data
}

/** POST /staff/bonuses — `reason` is required; the month may not be in the future. */
export async function createStaffBonus(form: StaffBonusForm): Promise<StaffBonusRow> {
  const { data } = await http.post<StaffBonusRow>('/staff/bonuses', form)
  return data
}

/** DELETE /staff/bonuses/{id} — 400 once the bonus was paid out with the salary. */
export async function deleteStaffBonus(id: number): Promise<StaffExtraDeleteResponse> {
  const { data } = await http.delete<StaffExtraDeleteResponse>(`/staff/bonuses/${id}`)
  return data
}

/** GET /staff/{userId}/bonuses — a BARE ARRAY, newest first. */
export async function fetchStaffBonuses(userId: number): Promise<StaffBonusRow[]> {
  const { data } = await http.get<StaffBonusRow[]>(`/staff/${userId}/bonuses`)
  return Array.isArray(data) ? data : []
}
