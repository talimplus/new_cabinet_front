/** One series of a `UiColumnChart` — identity, not a state. */
export interface ColumnSeries {
  key: string
  /** Already translated; shown in the legend and the tooltip. */
  label: string
  /** Background utility for the column (`bg-primary`, `bg-fg-subtle`). */
  fill: string
}

/** One slot on the x axis (a month); `values[i]` belongs to `series[i]`, null = no data. */
export interface ColumnCategory {
  key: string
  /** Short axis label (`Okt 26`). */
  label: string
  /** Longer tooltip title; the axis label when omitted. */
  title?: string
  values: (number | null)[]
  /** Extra tooltip line for this slot. */
  note?: string
}
