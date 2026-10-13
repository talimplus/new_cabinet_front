/** Event kind on the student timeline (`GET /students/:id/timeline`, backend-exact). */
export enum StudentTimelineType {
  LEAD_CREATED = 'lead_created',
  CREATED = 'created',
  ACTIVATED = 'activated',
  GROUP_JOINED = 'group_joined',
  GROUP_LEFT = 'group_left',
  TRANSFERRED = 'transferred',
  PAYMENT_RECEIVED = 'payment_received',
  PAYMENT_REFUNDED = 'payment_refunded',
  PAYMENT_EXCLUDED = 'payment_excluded',
  DISCOUNT_PERIOD = 'discount_period',
  FEE_CHANGED = 'fee_changed',
  REFERRED = 'referred',
  TELEGRAM_LINKED = 'telegram_linked',
  TELEGRAM_UNLINKED = 'telegram_unlinked',
  ATTENDANCE = 'attendance',
  STATUS_CHANGED = 'status_changed',
  PROFILE_UPDATED = 'profile_updated',
}

/** Filter bucket of a timeline event (backend-exact). */
export enum StudentTimelineCategory {
  STATUS = 'status',
  GROUPS = 'groups',
  PAYMENTS = 'payments',
  ATTENDANCE = 'attendance',
  PROFILE = 'profile',
}

export const TIMELINE_CATEGORY_LABEL_KEYS: Record<StudentTimelineCategory, string> = {
  [StudentTimelineCategory.STATUS]: 'students.timeline.filters.status',
  [StudentTimelineCategory.GROUPS]: 'students.timeline.filters.groups',
  [StudentTimelineCategory.PAYMENTS]: 'students.timeline.filters.payments',
  [StudentTimelineCategory.ATTENDANCE]: 'students.timeline.filters.attendance',
  [StudentTimelineCategory.PROFILE]: 'students.timeline.filters.profile',
}

/** Fields `profile_updated` may list → their form label keys. */
export const TIMELINE_FIELD_LABEL_KEYS: Record<string, string> = {
  firstName: 'students.form.firstName',
  lastName: 'students.form.lastName',
  phone: 'students.form.phone',
  secondPhone: 'students.form.secondPhone',
  birthDate: 'students.form.birthDate',
  comment: 'students.form.comment',
  heardAboutUs: 'students.form.heardAboutUs',
  preferredTime: 'students.form.preferredTime',
  preferredDays: 'students.form.preferredDays',
  passportSeries: 'students.form.passportSeries',
  passportNumber: 'students.form.passportNumber',
  jshshir: 'students.form.jshshir',
  freeMonths: 'students.form.freeMonths',
  centerId: 'students.form.center',
  subjects: 'students.form.subject',
  referrer: 'students.form.referrer',
  login: 'students.timeline.fields.login',
  password: 'students.timeline.fields.password',
}
