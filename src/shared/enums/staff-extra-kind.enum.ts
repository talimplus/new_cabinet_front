/** The two salary extras an admin writes for an employee. */
export enum StaffExtraKind {
  /** Avans — money handed out now, withheld from a later salary (or several). */
  ADVANCE = 'advance',
  /** Mukofot — added to a month's salary and paid with it. */
  BONUS = 'bonus',
}

export const STAFF_EXTRA_TITLE_KEYS: Record<StaffExtraKind, string> = {
  [StaffExtraKind.ADVANCE]: 'payroll.extras.advanceTitle',
  [StaffExtraKind.BONUS]: 'payroll.extras.bonusTitle',
}

/** Dialog title when an existing record is being corrected. */
export const STAFF_EXTRA_EDIT_TITLE_KEYS: Record<StaffExtraKind, string> = {
  [StaffExtraKind.ADVANCE]: 'payroll.extras.advanceEditTitle',
  [StaffExtraKind.BONUS]: 'payroll.extras.bonusEditTitle',
}
