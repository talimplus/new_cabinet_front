/** `POST /groups/:id/finish` body. */
export interface GroupFinishForm {
  /** `YYYY-MM-DD` — the LAST lesson day (inclusive); not in the future. */
  endDate: string
  /** Where the ticked students go (with `studentIds`). A NEW group is started. */
  targetGroupId?: number
  /** Moved from the day after `endDate`; everyone else finishes with the group. */
  studentIds?: number[]
  reason?: string
}

export interface GroupFinishResponse {
  groupId: number
  endDate: string
  /** `YYYY-MM-DD` — first day in the new group; null when nobody moved. */
  transferDate: string | null
  targetGroupId: number | null
  transferred: number
  finishedStudents: number
}
