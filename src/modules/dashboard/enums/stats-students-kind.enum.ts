/** `kind` of GET /statistics/details/students (backend-exact values). */
export enum StatsStudentsKind {
  ACTIVE = 'active',
  STARTED = 'started',
  REGISTERED = 'registered',
  STOPPED = 'stopped',
}

export const STATS_STUDENTS_KIND_LABEL_KEYS: Record<StatsStudentsKind, string> = {
  [StatsStudentsKind.ACTIVE]: 'statistics.students.active',
  [StatsStudentsKind.STARTED]: 'statistics.students.started',
  [StatsStudentsKind.REGISTERED]: 'statistics.students.registered',
  [StatsStudentsKind.STOPPED]: 'statistics.students.stopped',
}
