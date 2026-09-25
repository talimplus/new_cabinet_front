import type { AttendanceConfidence } from '@/shared/enums/attendance-confidence.enum'

/** Query params for GET /staff-attendance (centerId is injected by the interceptor). */
export interface StaffAttendanceParams {
  page?: number
  perPage?: number
  /** Filter to one employee. */
  userId?: number
  from?: string
  to?: string
  confidence?: AttendanceConfidence
  /** Only late arrivals. */
  onlyLate?: boolean
  /** Only low-trust (flagged) records. */
  onlyFlagged?: boolean
}
