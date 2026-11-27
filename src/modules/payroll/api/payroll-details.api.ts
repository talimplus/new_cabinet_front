import { http } from '@/shared/api/http'
import type { SalaryDetails } from '../interfaces/salary-details.interface'

/** GET /staff-salaries/details?userId=&forMonth=YYYY-MM — one salary step by step (404 if none). */
export async function fetchSalaryDetails(userId: number, forMonth: string): Promise<SalaryDetails> {
  const { data } = await http.get<SalaryDetails>('/staff-salaries/details', { params: { userId, forMonth } })
  return data
}
