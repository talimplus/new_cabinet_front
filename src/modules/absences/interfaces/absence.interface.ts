import type { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import type { PaginationMeta } from '@/shared/interfaces/paginated.interface'

export interface AbsencePerson {
  id: number
  firstName: string
  lastName: string
}

export interface AbsenceGroup {
  id: number
  name: string
}

export interface AbsenceStudent extends AbsencePerson {
  phone: string | null
  secondPhone: string | null
}

/** One `absent`/`excused` attendance row from GET /attendance/absences. */
export interface Absence {
  id: number
  lessonDate: string
  status: AttendanceStatus
  /** Teacher's note from the journal (required for `excused`). */
  comment: string | null
  /** What reception learned on the phone; `null` = not called yet. */
  followUpNote: string | null
  followedUpAt: string | null
  followedUpBy: AbsencePerson | null
  student: AbsenceStudent
  group: AbsenceGroup
  teacher: AbsencePerson | null
  /** How many times this student missed this group within the filtered range. */
  absencesInRange: number
}

/** Totals for the header cards — ignore the status / follow-up filters. */
export interface AbsenceSummary {
  absent: number
  excused: number
  notFollowedUp: number
}

export interface AbsencesResponse {
  data: Absence[]
  meta: PaginationMeta
  summary: AbsenceSummary
}

export interface AbsenceFollowUpResponse {
  id: number
  followUpNote: string | null
  followedUpAt: string | null
}
