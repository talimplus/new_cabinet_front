/** Reasons a staff check-in is flagged as low-trust (backend-computed). */
export enum AttendanceFlag {
  NO_GEO = 'no_geo',
  LOW_GPS_ACCURACY = 'low_gps_accuracy',
  FAR_FROM_CENTER = 'far_from_center',
  IP_MISMATCH = 'ip_mismatch',
  CENTER_NOT_CONFIGURED = 'center_not_configured',
  SHARED_DEVICE = 'shared_device',
  NO_LESSON_TODAY = 'no_lesson_today',
}

export const ATTENDANCE_FLAG_LABEL_KEYS: Record<AttendanceFlag, string> = {
  [AttendanceFlag.NO_GEO]: 'staffAttendance.flags.no_geo',
  [AttendanceFlag.LOW_GPS_ACCURACY]: 'staffAttendance.flags.low_gps_accuracy',
  [AttendanceFlag.FAR_FROM_CENTER]: 'staffAttendance.flags.far_from_center',
  [AttendanceFlag.IP_MISMATCH]: 'staffAttendance.flags.ip_mismatch',
  [AttendanceFlag.CENTER_NOT_CONFIGURED]: 'staffAttendance.flags.center_not_configured',
  [AttendanceFlag.SHARED_DEVICE]: 'staffAttendance.flags.shared_device',
  [AttendanceFlag.NO_LESSON_TODAY]: 'staffAttendance.flags.no_lesson_today',
}
