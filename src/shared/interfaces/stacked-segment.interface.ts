/** One part of a `UiStackedBar` — a state (paid / partial / unpaid…), not a series rank. */
export interface StackedSegment {
  key: string
  /** Already translated; shown in the legend and the hover tooltip. */
  label: string
  value: number
  /** Status tone: colors are reserved for states and always ship with the label. */
  tone: 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  /** Optional legend/tooltip figure in place of the count (e.g. a sum). */
  display?: string
}
