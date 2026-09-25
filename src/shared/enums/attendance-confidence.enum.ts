/** How trustworthy a staff check-in is (high = geo + IP matched). */
export enum AttendanceConfidence {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export const ATTENDANCE_CONFIDENCE_LABEL_KEYS: Record<AttendanceConfidence, string> = {
  [AttendanceConfidence.HIGH]: 'staffAttendance.confidence.high',
  [AttendanceConfidence.MEDIUM]: 'staffAttendance.confidence.medium',
  [AttendanceConfidence.LOW]: 'staffAttendance.confidence.low',
}

export const ATTENDANCE_CONFIDENCE_BADGE: Record<
  AttendanceConfidence,
  'success' | 'warning' | 'danger'
> = {
  [AttendanceConfidence.HIGH]: 'success',
  [AttendanceConfidence.MEDIUM]: 'warning',
  [AttendanceConfidence.LOW]: 'danger',
}

/** Who recorded the attendance. */
export enum AttendanceSource {
  SELF = 'self',
  RECEPTION = 'reception',
  MANUAL = 'manual',
}

export const ATTENDANCE_SOURCE_LABEL_KEYS: Record<AttendanceSource, string> = {
  [AttendanceSource.SELF]: 'staffAttendance.source.self',
  [AttendanceSource.RECEPTION]: 'staffAttendance.source.reception',
  [AttendanceSource.MANUAL]: 'staffAttendance.source.manual',
}
