import { http } from '@/shared/api/http'
import type { SalaryForecast } from '@/shared/interfaces/salary-forecast.interface'

/**
 * GET /staff-salaries/forecast — this month's expected salary (for deciding an
 * advance). In `shared/` because the advance dialog, the staff page and the
 * payroll breakdown all show it.
 */
export async function fetchSalaryForecast(userId: number, forMonth: string): Promise<SalaryForecast> {
  const { data } = await http.get<SalaryForecast>('/staff-salaries/forecast', { params: { userId, forMonth } })
  return data
}
