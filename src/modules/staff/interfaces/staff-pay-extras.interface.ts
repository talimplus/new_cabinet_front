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
