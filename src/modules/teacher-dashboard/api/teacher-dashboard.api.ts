import { http } from '@/shared/api/http'
import type {
  TeacherDashboardParams,
  TeacherDashboardResponse,
} from '../interfaces/teacher-dashboard.interface'

/**
 * GET /teachers/me/dashboard — the teacher's groups for one month: students,
 * payments by status, debt, attendance, a 6-month trend and the debtors.
 * A teacher always gets their own; other roles pass `teacherId` (else 422).
 */
export async function fetchTeacherDashboard(
  params: TeacherDashboardParams,
): Promise<TeacherDashboardResponse> {
  const { data } = await http.get<TeacherDashboardResponse>('/teachers/me/dashboard', { params })
  return data
}
