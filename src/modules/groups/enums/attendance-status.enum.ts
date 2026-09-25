import { CheckCircle2, XCircle, Clock, Info } from '@/shared/icons'
import type { FunctionalComponent } from '@/shared/icons'

/** Attendance status for a single student on a single lesson date (backend-exact). */
export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  LATE = 'late',
  EXCUSED = 'excused',
}

export const ATTENDANCE_STATUS_LABEL_KEYS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'groups.attendance.status.present',
  [AttendanceStatus.ABSENT]: 'groups.attendance.status.absent',
  [AttendanceStatus.LATE]: 'groups.attendance.status.late',
  [AttendanceStatus.EXCUSED]: 'groups.attendance.status.excused',
}

/** Badge/token variant per status (present→success, absent→danger, late→warning, excused→info). */
export const ATTENDANCE_STATUS_VARIANTS: Record<
  AttendanceStatus,
  'success' | 'danger' | 'warning' | 'info'
> = {
  [AttendanceStatus.PRESENT]: 'success',
  [AttendanceStatus.ABSENT]: 'danger',
  [AttendanceStatus.LATE]: 'warning',
  [AttendanceStatus.EXCUSED]: 'info',
}

/** Text-color utility class per status (used to tint the matrix cell icon). */
export const ATTENDANCE_STATUS_COLORS: Record<AttendanceStatus, string> = {
  [AttendanceStatus.PRESENT]: 'text-success',
  [AttendanceStatus.ABSENT]: 'text-danger',
  [AttendanceStatus.LATE]: 'text-warning',
  [AttendanceStatus.EXCUSED]: 'text-info',
}

/** Lucide icon per status. */
export const ATTENDANCE_STATUS_ICONS: Record<AttendanceStatus, FunctionalComponent> = {
  [AttendanceStatus.PRESENT]: CheckCircle2,
  [AttendanceStatus.ABSENT]: XCircle,
  [AttendanceStatus.LATE]: Clock,
  [AttendanceStatus.EXCUSED]: Info,
}
