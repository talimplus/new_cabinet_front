export enum StudentPreferredTime {
  MORNING = 'morning',
  EVENING = 'evening',
}

export const PREFERRED_TIME_LABEL_KEYS: Record<StudentPreferredTime, string> = {
  [StudentPreferredTime.MORNING]: 'students.time.morning',
  [StudentPreferredTime.EVENING]: 'students.time.evening',
}
