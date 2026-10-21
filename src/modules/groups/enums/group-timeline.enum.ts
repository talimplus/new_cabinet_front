/** Event kind on the group timeline (`GET /groups/:id/timeline`, backend-exact). */
export enum GroupTimelineType {
  GROUP_CREATED = 'group_created',
  GROUP_STARTED = 'group_started',
  GROUP_FINISHED = 'group_finished',
  GROUP_END_PLANNED = 'group_end_planned',
  TEACHER_ASSIGNED = 'teacher_assigned',
  TEACHER_CHANGED = 'teacher_changed',
  SCHEDULE_SET = 'schedule_set',
  SCHEDULE_CHANGED = 'schedule_changed',
  FEE_SET = 'fee_set',
  FEE_CHANGED = 'fee_changed',
  PAUSE = 'pause',
  LESSON_MOVED = 'lesson_moved',
  STUDENT_JOINED = 'student_joined',
  STUDENT_LEFT = 'student_left',
  STUDENT_TRANSFERRED_IN = 'student_transferred_in',
  STUDENT_TRANSFERRED_OUT = 'student_transferred_out',
}

/**
 * Filter bucket of a group event. Client-side only — the backend sends no
 * category. GROUP (created / started / finished) has no chip of its own.
 */
export enum GroupTimelineCategory {
  GROUP = 'group',
  TEACHER = 'teacher',
  SCHEDULE = 'schedule',
  FEE = 'fee',
  PAUSE = 'pause',
  STUDENTS = 'students',
}

export const GROUP_TIMELINE_CATEGORY_OF: Record<GroupTimelineType, GroupTimelineCategory> = {
  [GroupTimelineType.GROUP_CREATED]: GroupTimelineCategory.GROUP,
  [GroupTimelineType.GROUP_STARTED]: GroupTimelineCategory.GROUP,
  [GroupTimelineType.GROUP_FINISHED]: GroupTimelineCategory.GROUP,
  [GroupTimelineType.GROUP_END_PLANNED]: GroupTimelineCategory.GROUP,
  [GroupTimelineType.TEACHER_ASSIGNED]: GroupTimelineCategory.TEACHER,
  [GroupTimelineType.TEACHER_CHANGED]: GroupTimelineCategory.TEACHER,
  [GroupTimelineType.SCHEDULE_SET]: GroupTimelineCategory.SCHEDULE,
  [GroupTimelineType.SCHEDULE_CHANGED]: GroupTimelineCategory.SCHEDULE,
  // A moved lesson is a one-off schedule change.
  [GroupTimelineType.LESSON_MOVED]: GroupTimelineCategory.SCHEDULE,
  [GroupTimelineType.FEE_SET]: GroupTimelineCategory.FEE,
  [GroupTimelineType.FEE_CHANGED]: GroupTimelineCategory.FEE,
  [GroupTimelineType.PAUSE]: GroupTimelineCategory.PAUSE,
  [GroupTimelineType.STUDENT_JOINED]: GroupTimelineCategory.STUDENTS,
  [GroupTimelineType.STUDENT_LEFT]: GroupTimelineCategory.STUDENTS,
  [GroupTimelineType.STUDENT_TRANSFERRED_IN]: GroupTimelineCategory.STUDENTS,
  [GroupTimelineType.STUDENT_TRANSFERRED_OUT]: GroupTimelineCategory.STUDENTS,
}

export const GROUP_TIMELINE_CATEGORY_LABEL_KEYS: Record<GroupTimelineCategory, string> = {
  [GroupTimelineCategory.GROUP]: 'groups.timeline.filters.group',
  [GroupTimelineCategory.TEACHER]: 'groups.timeline.filters.teacher',
  [GroupTimelineCategory.SCHEDULE]: 'groups.timeline.filters.schedule',
  [GroupTimelineCategory.FEE]: 'groups.timeline.filters.fee',
  [GroupTimelineCategory.PAUSE]: 'groups.timeline.filters.pause',
  [GroupTimelineCategory.STUDENTS]: 'groups.timeline.filters.students',
}
