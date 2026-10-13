import { http } from '@/shared/api/http'
import type { StudentTimelineResponse } from '../interfaces/student-timeline.interface'

/**
 * GET /students/{id}/timeline — everything that happened to the student,
 * newest first. Payment events come only with `payments.view`, attendance
 * only with `attendance.view` (the backend filters, not the client).
 */
export async function fetchStudentTimeline(studentId: number): Promise<StudentTimelineResponse> {
  const { data } = await http.get<StudentTimelineResponse>(`/students/${studentId}/timeline`)
  return { items: Array.isArray(data?.items) ? data.items : [] }
}
