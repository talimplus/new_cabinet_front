import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentPreferredTime } from '@/modules/students/enums/student-preferred-time.enum'
import type { LeadStatus } from '../enums/lead-status.enum'

/** A lead row from GET /leads. */
export interface Lead {
  id: number
  firstName?: string | null
  lastName?: string | null
  phone: string
  secondPhone?: string | null
  birthDate?: string | null
  monthlyFee?: number | null
  discountPercent?: number | null
  discountReason?: string | null
  comment?: string | null
  heardAboutUs?: string | null
  preferredTime?: StudentPreferredTime | null
  preferredDays?: WeekDay[] | null
  passportSeries?: string | null
  passportNumber?: string | null
  jshshir?: string | null
  status?: LeadStatus
  groupIds?: number[]
  centerId?: number
  followUpDate?: string | null
  createdAt?: string
  updatedAt?: string
  /** UI-only: per-row status-change spinner. */
  statusLoading?: boolean
}
