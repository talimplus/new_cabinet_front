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

/** An existing advance / bonus opened for correction (`PATCH /staff/{advances|bonuses}/{id}`). */
export interface StaffExtraEdit {
  id: number
  amount: number
  /** "YYYY-MM" or "YYYY-MM-DD" — only the month is used. */
  forMonth: string
  /** Advance comment or bonus reason. */
  text: string
}

/** `PATCH /staff/advances/{id}` — every field optional on the backend; the dialog sends all three. */
export interface StaffAdvancePatch {
  amount: number
  /** "YYYY-MM". */
  forMonth: string
  /** '' clears the comment (the backend stores "Avans"). */
  comment: string
}

/** `PATCH /staff/bonuses/{id}` — lowering / moving a bonus already paid out → 400. */
export interface StaffBonusPatch {
  amount: number
  /** "YYYY-MM", never in the future. */
  forMonth: string
  reason: string
}

/** Who the extras dialog is opened for. */
export interface StaffExtraTarget {
  userId: number
  /** Shown in the dialog. */
  name: string
  /** "YYYY-MM" — a bonus defaults to it (e.g. the payroll row's month); else the current month. */
  month?: string
  /** Set = correct this existing record instead of creating a new one. */
  edit?: StaffExtraEdit
}
