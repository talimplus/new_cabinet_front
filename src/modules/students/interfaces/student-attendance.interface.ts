import type { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import type { GroupStatus } from '@/modules/groups/enums/group-status.enum'

export interface StudentAttendanceCounts {
  present: number
  absent: number
  late: number
  excused: number
  total: number
}

/** The student's period in one group — former (transferred, stopped) ones too. */
export interface StudentAttendanceGroup {
  groupId: number
  groupName: string
  groupStatus: GroupStatus | ''
  /** `YYYY-MM-DD`, or null for old data without a membership window. */
  joinedAt: string | null
  /** `YYYY-MM-DD` (exclusive); null — still in this group. */
  leftAt: string | null
  transferredToGroupName: string | null
  isCurrent: boolean
  counts: StudentAttendanceCounts
}

/** One lesson mark, newest first. */
export interface StudentAttendanceItem {
  id: number
  /** `YYYY-MM-DD` */
  lessonDate: string
  groupId: number
  groupName: string
  status: AttendanceStatus
  comment: string | null
  /** Who marked it (teacher/staff full name). */
  submittedBy: string | null
}

/** GET /students/{id}/attendance */
export interface StudentAttendanceResponse {
  groups: StudentAttendanceGroup[]
  items: StudentAttendanceItem[]
}
