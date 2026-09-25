import { http } from '@/shared/api/http'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'
import type { StaffAttendanceParams } from '../interfaces/staff-attendance-params.interface'
import type { StaffAttendanceReport } from '../interfaces/staff-attendance-report.interface'
import type { ManualAttendanceForm } from '../interfaces/manual-attendance-form.interface'

/**
 * The admin half of staff attendance (the check-in half lives in
 * `shared/api/staff-attendance.api.ts`, shared with `/today`).
 */

/** GET /staff-attendance — the daily records log, paginated. */
export async function fetchStaffAttendance(
  params: StaffAttendanceParams,
): Promise<PaginatedResponse<StaffAttendance>> {
  const { data } = await http.get<PaginatedResponse<StaffAttendance>>('/staff-attendance', { params })
  return data
}

/** GET /staff-attendance/report — per-employee summary for a date window. */
export async function fetchStaffAttendanceReport(
  from: string,
  to: string,
): Promise<StaffAttendanceReport> {
  const { data } = await http.get<StaffAttendanceReport>('/staff-attendance/report', {
    params: { from, to },
  })
  return data
}

/** POST /staff-attendance/manual — record attendance for an employee. */
export async function createManualAttendance(form: ManualAttendanceForm): Promise<StaffAttendance> {
  const { data } = await http.post<StaffAttendance>('/staff-attendance/manual', form)
  return data
}

/** POST /staff-attendance/{id}/confirm — mark a record as verified. */
export async function confirmStaffAttendance(id: number): Promise<void> {
  await http.post(`/staff-attendance/${id}/confirm`)
}

/** DELETE /staff-attendance/{id} — remove a record. */
export async function deleteStaffAttendance(id: number): Promise<void> {
  await http.delete(`/staff-attendance/${id}`)
}
