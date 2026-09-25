export enum WeekDay {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

/** i18n key per weekday — weekdays are shared, so they live in `common`. */
export const WEEK_DAY_LABEL_KEYS: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: 'common.weekDays.monday',
  [WeekDay.TUESDAY]: 'common.weekDays.tuesday',
  [WeekDay.WEDNESDAY]: 'common.weekDays.wednesday',
  [WeekDay.THURSDAY]: 'common.weekDays.thursday',
  [WeekDay.FRIDAY]: 'common.weekDays.friday',
  [WeekDay.SATURDAY]: 'common.weekDays.saturday',
  [WeekDay.SUNDAY]: 'common.weekDays.sunday',
}

/** Two-letter abbreviations for dense UI (schedule chips, table cells). */
export const WEEK_DAY_SHORT_KEYS: Record<WeekDay, string> = {
  [WeekDay.MONDAY]: 'common.weekDaysShort.monday',
  [WeekDay.TUESDAY]: 'common.weekDaysShort.tuesday',
  [WeekDay.WEDNESDAY]: 'common.weekDaysShort.wednesday',
  [WeekDay.THURSDAY]: 'common.weekDaysShort.thursday',
  [WeekDay.FRIDAY]: 'common.weekDaysShort.friday',
  [WeekDay.SATURDAY]: 'common.weekDaysShort.saturday',
  [WeekDay.SUNDAY]: 'common.weekDaysShort.sunday',
}
