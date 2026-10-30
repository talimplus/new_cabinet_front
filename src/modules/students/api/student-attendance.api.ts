import { http } from '@/shared/api/http'
import type { StudentAttendanceResponse } from '../interfaces/student-attendance.interface'

/**
 * GET /students/{id}/attendance — every lesson mark across ALL the student's
 * groups, the ones they were transferred out of or that already finished too.
 * Needs `attendance.view`.
 */
export async function fetchStudentAttendance(studentId: number): Promise<StudentAttendanceResponse> {
  const { data } = await http.get<StudentAttendanceResponse>(`/students/${studentId}/attendance`)
  return {
    groups: Array.isArray(data?.groups) ? data.groups : [],
    items: Array.isArray(data?.items) ? data.items : [],
  }
}
