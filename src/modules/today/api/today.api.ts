import { http } from '@/shared/api/http'
import type { TeacherToday } from '../interfaces/teacher-today.interface'

/**
 * GET /teachers/me/today — the current user's lessons for today. The http
 * interceptor injects the active `centerId` (the endpoint accepts it), so an
 * admin gets the whole center (`scope: 'center'`) and a teacher gets their own.
 */
export async function fetchTeacherToday(): Promise<TeacherToday> {
  const { data } = await http.get<TeacherToday>('/teachers/me/today')
  return data
}
