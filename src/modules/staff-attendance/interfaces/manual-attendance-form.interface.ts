/** POST /staff-attendance/manual body — recording attendance on an employee's behalf. */
export interface ManualAttendanceForm {
  userId: number
  /** `YYYY-MM-DD`. */
  workDate: string
  /** `HH:mm` arrival time. */
  checkInTime: string
  note?: string
}
