import type { StudentPayState } from '../enums/student-pay-state.enum'
import type { TeacherDashboardGroup, TeacherGroupStudent } from './teacher-dashboard.interface'

/** A student row of a group panel, with its derived month state. */
export interface GroupStudentRow extends TeacherGroupStudent {
  /** `studentId-groupId` — the table row key. */
  key: string
  state: StudentPayState
}

/** One group on the dashboard with the students left after search and tabs. */
export interface GroupPanel {
  group: TeacherDashboardGroup
  rows: GroupStudentRow[]
}

/** Search box, group picker and status tab above the group panels. */
export interface GroupStudentsFilters {
  search: string
  groupId: number | null
  status: string
}
