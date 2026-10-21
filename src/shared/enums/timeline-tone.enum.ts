/** Colour of a timeline marker / amount — maps onto the semantic status tokens. */
export enum TimelineTone {
  PRIMARY = 'primary',
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  DANGER = 'danger',
  NEUTRAL = 'neutral',
}

/** Marker circle: soft fill + strong icon colour (both themes via tokens). */
export const TIMELINE_TONE_MARKER: Record<TimelineTone, string> = {
  [TimelineTone.PRIMARY]: 'bg-primary-soft text-primary',
  [TimelineTone.SUCCESS]: 'bg-success-soft text-success',
  [TimelineTone.INFO]: 'bg-info-soft text-info',
  [TimelineTone.WARNING]: 'bg-warning-soft text-warning',
  [TimelineTone.DANGER]: 'bg-danger-soft text-danger',
  [TimelineTone.NEUTRAL]: 'bg-surface-muted text-muted-foreground',
}

export const TIMELINE_TONE_TEXT: Record<TimelineTone, string> = {
  [TimelineTone.PRIMARY]: 'text-primary',
  [TimelineTone.SUCCESS]: 'text-success',
  [TimelineTone.INFO]: 'text-info',
  [TimelineTone.WARNING]: 'text-warning',
  [TimelineTone.DANGER]: 'text-danger',
  [TimelineTone.NEUTRAL]: 'text-muted-foreground',
}
