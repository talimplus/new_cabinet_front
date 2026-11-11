/** Body for `POST /staff/advances` — money handed out now, withheld from a salary later. */
export interface StaffAdvanceForm {
  userId: number
  amount: number
  /** "YYYY-MM" work month it is withheld from; default current, at most next month. */
  forMonth?: string
  comment?: string
}

/** Body for `POST /staff/bonuses` — added to that month's salary and paid with it. */
export interface StaffBonusForm {
  userId: number
  amount: number
  /** "YYYY-MM" work month; default current, never in the future. */
  forMonth?: string
  reason: string
}

/** Who the extras dialog is opened for. */
export interface StaffExtraTarget {
  userId: number
  /** Shown in the dialog. */
  name: string
  /** "YYYY-MM" — a bonus defaults to it (e.g. the payroll row's month); else the current month. */
  month?: string
}
