/** The two salary extras an admin writes from the payroll row. */
export enum PayrollExtraKind {
  /** Avans — money handed out now, withheld from a salary later. */
  ADVANCE = 'advance',
  /** Mukofot — added to a month's salary and paid with it. */
  BONUS = 'bonus',
}

export const PAYROLL_EXTRA_TITLE_KEYS: Record<PayrollExtraKind, string> = {
  [PayrollExtraKind.ADVANCE]: 'payroll.extras.advanceTitle',
  [PayrollExtraKind.BONUS]: 'payroll.extras.bonusTitle',
}
