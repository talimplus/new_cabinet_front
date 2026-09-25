import { http } from './http'
import type {
  StaffAttendanceToday,
  CheckInForm,
  CheckInResult,
} from '@/shared/interfaces/staff-attendance.interface'

/**
 * The check-in half of staff attendance — shared because both `/today` (the
 * teacher's check-in card) and `/staff-attendance` (the admin page, §3.3) use
 * it. The admin-only endpoints live in the staff-attendance module.
 */

/** GET /staff-attendance/me/today — my check-in state for today. */
export async function fetchMyAttendanceToday(): Promise<StaffAttendanceToday> {
  const { data } = await http.get<StaffAttendanceToday>('/staff-attendance/me/today')
  return data
}

/** POST /staff-attendance/check-in — records the teacher's arrival. */
export async function checkIn(form: CheckInForm): Promise<CheckInResult> {
  const { data } = await http.post<CheckInResult>('/staff-attendance/check-in', form)
  return data
}
