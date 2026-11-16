/** Quick period buttons of the statistics pages; CUSTOM = picked in the calendar. */
export enum DatePreset {
  TODAY = 'today',
  WEEK = 'week',
  MONTH = 'month',
  CUSTOM = 'custom',
}

export const DATE_PRESET_LABEL_KEYS: Record<DatePreset, string> = {
  [DatePreset.TODAY]: 'statistics.period.today',
  [DatePreset.WEEK]: 'statistics.period.week',
  [DatePreset.MONTH]: 'statistics.period.month',
  [DatePreset.CUSTOM]: 'statistics.period.custom',
}
