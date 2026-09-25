import { http } from '@/shared/api/http'
import type { DashboardParams, DashboardResponse } from '../interfaces/dashboard.interface'

export async function fetchDashboard(params: DashboardParams): Promise<DashboardResponse> {
  const { data } = await http.get<DashboardResponse>('/statistics/dashboard', { params })
  return data
}
