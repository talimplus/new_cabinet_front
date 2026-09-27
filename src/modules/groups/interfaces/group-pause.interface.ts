/** A period the group is paused — its lessons are not held and not billed. */
export interface GroupPause {
  id: number
  groupId: number
  /** `YYYY-MM-DD`, inclusive. */
  fromDate: string
  /** `YYYY-MM-DD`, inclusive. */
  toDate: string
  reason: string
  createdAt: string
}

/** POST /groups/{id}/pauses body. */
export interface GroupPauseForm {
  fromDate: string
  toDate: string
  reason: string
}
