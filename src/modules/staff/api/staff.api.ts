import { http } from '@/shared/api/http'
import type {
  StaffDeductionForm,
  StaffDeductionRow,
  StaffOverview,
} from '../interfaces/staff-overview.interface'

/** GET /staff/{userId}/overview — someone else's page; needs `staffPerformance.view`. */
export async function fetchStaffOverview(
  userId: number,
  forMonth?: string,
): Promise<StaffOverview> {
  const { data } = await http.get<StaffOverview>(`/staff/${userId}/overview`, {
    params: forMonth ? { forMonth } : undefined,
  })
  return data
}

/** GET /staff/me/overview — every employee may open their own. */
export async function fetchMyOverview(forMonth?: string): Promise<StaffOverview> {
  const { data } = await http.get<StaffOverview>('/staff/me/overview', {
    params: forMonth ? { forMonth } : undefined,
  })
  return data
}

/** GET /staff/{userId}/deductions — a BARE ARRAY, not paginated. */
export async function fetchStaffDeductions(userId: number): Promise<StaffDeductionRow[]> {
  const { data } = await http.get<StaffDeductionRow[]>(`/staff/${userId}/deductions`)
  return Array.isArray(data) ? data : []
}

/** POST /staff/deductions — a fine is written by an admin, never by the system. */
export async function createStaffDeduction(
  form: StaffDeductionForm,
): Promise<StaffDeductionRow> {
  const { data } = await http.post<StaffDeductionRow>('/staff/deductions', form)
  return data
}

/** DELETE /staff/deductions/{id} — the salary is recomputed server-side. */
export async function deleteStaffDeduction(id: number): Promise<void> {
  await http.delete(`/staff/deductions/${id}`)
}
