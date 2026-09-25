import type { AttendanceFlag } from '@/shared/enums/attendance-flag.enum'
import type { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'

/** A minimal employee reference carried on an attendance row. */
export interface AttendanceUser {
  id: number
  firstName: string
  lastName: string
}

/** One staff attendance record (a check-in for a work day). */
export interface StaffAttendance {
  id: number
  userId: number
  centerId: number
  workDate: string
  /** ISO datetime the person checked in. */
  checkInAt: string
  firstLessonAt: string | null
  lateMinutes: number
  source: AttendanceSource
  confidence: AttendanceConfidence
  distanceMeters: number | null
  geoMatched: boolean
  ipMatched: boolean
  flags: AttendanceFlag[]
  confirmedByUserId: number | null
  confirmedAt: string | null
  note: string | null
  user?: AttendanceUser | null
}

/** GET /staff-attendance/me/today — my check-in state for today. */
export interface StaffAttendanceToday {
  date: string
  checkedIn: boolean
  attendance: StaffAttendance | null
  firstLessonAt: string | null
  lessonsToday: number
  centerConfigured: boolean
}

/** POST /staff-attendance/check-in body (all optional — no coords is allowed). */
export interface CheckInForm {
  deviceId?: string
  latitude?: number
  longitude?: number
  accuracyMeters?: number
}

/** POST /staff-attendance/check-in response. */
export interface CheckInResult {
  alreadyCheckedIn: boolean
  attendance: StaffAttendance
}
