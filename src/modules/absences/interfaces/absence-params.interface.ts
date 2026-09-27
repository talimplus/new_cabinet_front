import type { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'

/** Query params of GET /attendance/absences (`centerId` comes from the interceptor). */
export interface AbsencesParams {
  page?: number
  perPage?: number
  from?: string
  to?: string
  groupId?: number
  teacherId?: number
  status?: AttendanceStatus.ABSENT | AttendanceStatus.EXCUSED
  /** `false` — not called yet, `true` — already called. */
  followedUp?: boolean
  search?: string
}
