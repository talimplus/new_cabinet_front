import { http } from '@/shared/api/http'
import type {
  LessonDatesResponse,
  LessonDatesParams,
  SubmitAttendancePayload,
  RescheduleAttendancePayload,
} from '../interfaces/attendance.interface'

/** GET /groups/{groupId}/attendance/lesson-dates — the matrix data for a window. */
export async function fetchLessonDates(
  groupId: number,
  params?: LessonDatesParams,
): Promise<LessonDatesResponse> {
  const { data } = await http.get<LessonDatesResponse>(
    `/groups/${groupId}/attendance/lesson-dates`,
    { params },
  )
  return data
}

/** POST /groups/{groupId}/attendance/submit — save statuses for one lesson date. */
export async function submitAttendance(
  groupId: number,
  payload: SubmitAttendancePayload,
): Promise<void> {
  await http.post(`/groups/${groupId}/attendance/submit`, payload)
}

/** POST /groups/{groupId}/attendance/reschedule — move a lesson to another date. */
export async function rescheduleAttendance(
  groupId: number,
  payload: RescheduleAttendancePayload,
): Promise<void> {
  await http.post(`/groups/${groupId}/attendance/reschedule`, payload)
}
