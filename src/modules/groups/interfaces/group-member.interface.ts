import type { StudentStatus } from '@/modules/students/enums/student-status.enum'

/** GET /groups/{id}/members row — everyone who ever studied in the group. */
export interface GroupMember {
  studentId: number
  firstName: string
  lastName: string
  phone: string | null
  studentStatus: StudentStatus
  /** `YYYY-MM-DD` — first join. */
  joinedAt: string
  /** `YYYY-MM-DD` (exclusive) — last leave; null while still a member. */
  leftAt: string | null
  leftReason: string | null
  transferredToGroupId: number | null
  transferredToGroupName: string | null
  /** In the group right now. */
  isCurrent: boolean
  /** Unpaid in THIS group; null without `payments.view`. */
  debt: number | null
}
