import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'
import type { ReturnLikelihood } from '../enums/return-likelihood.enum'

/** Query params for GET /students. */
export interface StudentsParams {
  centerId?: number
  status?: StudentStatus
  search?: string
  name?: string
  phone?: string
  subjectId?: number
  groupId?: number
  preferredTime?: StudentPreferredTime
  preferredDays?: WeekDay[]
  returnLikelihood?: ReturnLikelihood
  page?: number
  perPage?: number
}
