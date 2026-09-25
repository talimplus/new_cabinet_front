/** What is double-booked: the chosen room, or the chosen teacher. */
export enum ScheduleConflictReason {
  ROOM = 'room',
  TEACHER = 'teacher',
}

/** One message template per reason (`{day}`, `{time}`, `{room}`, `{teacher}`, `{group}`, `{busy}`). */
export const SCHEDULE_CONFLICT_MESSAGE_KEYS: Record<ScheduleConflictReason, string> = {
  [ScheduleConflictReason.ROOM]: 'schedule.conflict.room',
  [ScheduleConflictReason.TEACHER]: 'schedule.conflict.teacher',
}
