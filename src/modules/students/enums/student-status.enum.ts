export enum StudentStatus {
  NEW = 'new',
  ACTIVE = 'ACTIVE', // ⚠️ uppercase on purpose — backend returns/expects this exact casing
  IGNORED = 'ignored',
  STOPPED = 'stopped',
  FINISHED = 'finished',
}

export const STUDENT_STATUS_LABEL_KEYS: Record<StudentStatus, string> = {
  [StudentStatus.NEW]: 'students.status.new',
  [StudentStatus.ACTIVE]: 'students.status.active',
  [StudentStatus.IGNORED]: 'students.status.ignored',
  [StudentStatus.STOPPED]: 'students.status.stopped',
  [StudentStatus.FINISHED]: 'students.status.finished',
}

export const STUDENT_STATUS_VARIANTS: Record<
  StudentStatus,
  'info' | 'success' | 'warning' | 'danger' | 'neutral'
> = {
  [StudentStatus.NEW]: 'info',
  [StudentStatus.ACTIVE]: 'success',
  [StudentStatus.IGNORED]: 'warning',
  [StudentStatus.STOPPED]: 'danger',
  [StudentStatus.FINISHED]: 'neutral',
}

/**
 * Allowed status transitions per page (mirrors old cabinet_front):
 * reception(new)→active/ignored, active→stopped/finished, others→new.
 */
export const STUDENT_STATUS_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  [StudentStatus.NEW]: [StudentStatus.ACTIVE, StudentStatus.IGNORED],
  [StudentStatus.ACTIVE]: [StudentStatus.STOPPED, StudentStatus.FINISHED],
  [StudentStatus.IGNORED]: [StudentStatus.NEW],
  [StudentStatus.STOPPED]: [StudentStatus.NEW],
  [StudentStatus.FINISHED]: [StudentStatus.NEW],
}
