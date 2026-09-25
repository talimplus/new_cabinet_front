import { http } from '@/shared/api/http'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import type { StaffSalariesParams } from '../interfaces/staff-salaries-params.interface'
import type { PayStaffSalaryForm } from '../interfaces/pay-staff-salary-form.interface'

/** GET /staff-salaries → a BARE ARRAY of StaffSalary (NOT paginated). */
export async function fetchStaffSalaries(params: StaffSalariesParams): Promise<StaffSalary[]> {
  const { data } = await http.get<StaffSalary[]>('/staff-salaries', { params })
  return data
}

/** PUT /staff-salaries/pay/{id} — record a (possibly partial) salary payment. */
export async function payStaffSalary(id: number, form: PayStaffSalaryForm): Promise<void> {
  await http.put(`/staff-salaries/pay/${id}`, form)
}
