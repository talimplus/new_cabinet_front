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

/** One bonus (`GET /staff/{userId}/bonuses`, `overview.bonuses[]`, POST response). */
export interface StaffBonusRow {
  id: number
  userId: number
  amount: number
  reason: string
  /** "YYYY-MM-01". */
  forMonth: string
  createdAt: string
  createdBy: { id: number; firstName: string; lastName: string } | null
}

/** `DELETE /staff/advances/{id}` and `DELETE /staff/bonuses/{id}`. */
export interface StaffExtraDeleteResponse {
  success: boolean
}
