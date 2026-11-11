/** One bar of the "how my salary is formed" waterfall, in so'm on one scale. */
export interface SalaryStep {
  key: string
  /** Already translated. */
  label: string
  /** The step's own amount (always ≥ 0; `sign` says which way it moves). */
  amount: number
  /** `+`, `−`, or '' for the two totals. */
  sign: string
  /** Where the bar starts and ends on the scale. */
  from: number
  to: number
  /** Background utility of the bar. */
  fill: string
  /** Totals (Hisoblangan, Beriladigan) stand on the baseline and read bold. */
  total: boolean
  /** One-line explanation for the tooltip. */
  hint?: string
}
