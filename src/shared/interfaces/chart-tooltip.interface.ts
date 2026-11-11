/** One line of a chart tooltip: the series name and its formatted figure. */
export interface ChartTooltipRow {
  key: string
  /** Already translated series / part name. */
  label: string
  /** Already formatted figure (`1 200 000 so'm`, `85%`, `12`). */
  value: string
  /** Optional share of the whole, already formatted (`46%`). */
  share?: string
  /** Background utility of the mark (`bg-success`) — drawn as a short line key. */
  fill?: string
}

/** What a hovered / focused / tapped mark shows. */
export interface ChartTooltipData {
  /** Category the mark belongs to (a month, a group…). */
  title?: string
  rows: ChartTooltipRow[]
  /** A one-line note under the rows (e.g. "collected 85%"). */
  footer?: string
}
