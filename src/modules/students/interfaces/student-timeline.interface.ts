import type {
  StudentTimelineCategory,
  StudentTimelineType,
} from '../enums/student-timeline.enum'

/** `{ id, name }` reference to a staff member or a group. */
export interface TimelineRef {
  id: number
  name: string
}

/**
 * Type-specific payload. Every field is optional — which ones arrive depends on
 * `type` (see `docs/01-api-integration.md`, student timeline).
 */
export interface StudentTimelineDetails {
  // money
  amount?: number
  status?: string
  method?: string | null
  checkNo?: string | null
  forMonth?: string
  paidAt?: string | null
  confirmedByName?: string | null
  confirmedAt?: string | null
  newAmountDue?: number
  lessons?: number | null
  // discount / fee
  percent?: number
  monthlyFee?: number | null
  fromMonth?: string
  toMonth?: string | null
  // status
  fromStatus?: string | null
  toStatus?: string
  returnLikelihood?: string | null
  derived?: boolean
  // transfer
  fromGroupId?: number
  fromGroupName?: string
  toGroupId?: number
  toGroupName?: string
  transferDate?: string
  carriedOverAmount?: number
  refundedAmount?: number
  remainingDebt?: number
  deletedAttendance?: number
  // misc
  fromLead?: boolean
  fields?: string[]
  referrerId?: number
  referrerName?: string
  parentName?: string | null
  username?: string | null
  blocked?: boolean
  comment?: string | null
  reason?: string | null
}

export interface StudentTimelineItem {
  /** Stable key, e.g. `receipt:1636`. */
  id: string
  type: StudentTimelineType
  category: StudentTimelineCategory
  /** ISO timestamp, or `YYYY-MM-DD` when `dateOnly`. */
  occurredAt: string
  dateOnly: boolean
  actor: TimelineRef | null
  group: TimelineRef | null
  details: StudentTimelineDetails
}

/** GET /students/{id}/timeline — newest first. */
export interface StudentTimelineResponse {
  items: StudentTimelineItem[]
}
