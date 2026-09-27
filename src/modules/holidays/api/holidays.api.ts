import { http } from '@/shared/api/http'
import type { Holiday, HolidayForm, HolidaysParams } from '../interfaces/holiday.interface'

/** GET /holidays — the active center's + organization-wide holidays, newest first. */
export async function fetchHolidays(params?: HolidaysParams): Promise<Holiday[]> {
  const { data } = await http.get<Holiday[]>('/holidays', { params })
  return Array.isArray(data) ? data : []
}

/** POST /holidays — no lessons on those days; payments are recalculated. */
export async function createHoliday(form: HolidayForm): Promise<Holiday> {
  const { data } = await http.post<Holiday>('/holidays', form)
  return data
}

/** DELETE /holidays/{id}. */
export async function deleteHoliday(id: number): Promise<void> {
  await http.delete(`/holidays/${id}`)
}
