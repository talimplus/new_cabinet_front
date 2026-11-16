/** The one-word verdict of the statistics digest. */
export enum HealthLevel {
  GOOD = 'good',
  OK = 'ok',
  BAD = 'bad',
}

export const HEALTH_LEVEL_LABEL_KEYS: Record<HealthLevel, string> = {
  [HealthLevel.GOOD]: 'statistics.summary.level.good',
  [HealthLevel.OK]: 'statistics.summary.level.ok',
  [HealthLevel.BAD]: 'statistics.summary.level.bad',
}

export const HEALTH_LEVEL_VARIANTS: Record<HealthLevel, 'success' | 'warning' | 'danger'> = {
  [HealthLevel.GOOD]: 'success',
  [HealthLevel.OK]: 'warning',
  [HealthLevel.BAD]: 'danger',
}

/** Colour of one digest sentence. */
export enum SummaryTone {
  DEFAULT = 'default',
  SUCCESS = 'success',
  WARNING = 'warning',
  DANGER = 'danger',
}

export const SUMMARY_TONE_CLASSES: Record<SummaryTone, string> = {
  [SummaryTone.DEFAULT]: 'bg-fg-subtle',
  [SummaryTone.SUCCESS]: 'bg-success',
  [SummaryTone.WARNING]: 'bg-warning',
  [SummaryTone.DANGER]: 'bg-danger',
}
