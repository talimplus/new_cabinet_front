import type { UserRole } from '@/shared/enums/user-role.enum'

export interface StaffReportUser {
  id: number
  firstName: string
  lastName: string
  role: UserRole
}

/** One employee's attendance summary over the report window. */
export interface StaffReportRow {
  user: StaffReportUser
  expectedDays: number
  attendedDays: number
  missedDays: number
  lateDays: number
  totalLateMinutes: number
  flaggedDays: number
}

/** GET /staff-attendance/report response. */
export interface StaffAttendanceReport {
  from: string
  to: string
  centerNotConfigured: boolean
  rows: StaffReportRow[]
}
