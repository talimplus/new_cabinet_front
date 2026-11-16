/** One line of a `UiLineChart`; `values[i]` belongs to `categories[i]`, null = no data. */
export interface LineSeries {
  key: string
  /** Already translated; shown in the legend and the tooltip. */
  label: string
  /** Stroke utility of the line (`stroke-brand`). */
  stroke: string
  /** Background utility of its dots / legend key (`bg-brand`). */
  fill: string
  /** A dashed line — for a target / expected figure next to the actual one. */
  dashed?: boolean
  values: (number | null)[]
}

/** One slot on the x axis (a month). */
export interface LineCategory {
  key: string
  /** Short axis label (`Noy 26`). */
  label: string
  /** Longer tooltip title; the axis label when omitted. */
  title?: string
  /** Extra tooltip line for this slot. */
  note?: string
}
