import { http } from '@/shared/api/http'
import type {
  StaffBonusRow,
  StaffExtraDeleteResponse,
} from '../interfaces/staff-pay-extras.interface'
// Creating an advance/bonus lives in `shared/api/staff-extras.api.ts` (three modules open that dialog).

/** DELETE /staff/advances/{id} — undo a mistaken advance; salaries are recomputed. */
export async function deleteStaffAdvance(id: number): Promise<StaffExtraDeleteResponse> {
  const { data } = await http.delete<StaffExtraDeleteResponse>(`/staff/advances/${id}`)
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
