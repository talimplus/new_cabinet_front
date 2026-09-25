import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentPreferredTime } from '@/modules/students/enums/student-preferred-time.enum'
import type { LeadStatus } from '../enums/lead-status.enum'

/** POST /leads and PUT /leads/:id body. Only `phone` is required. */
export interface LeadForm {
  firstName?: string
  lastName?: string
  phone: string
  secondPhone?: string
  birthDate?: string // "YYYY-MM-DD"
  monthlyFee?: number
  discountPercent?: number
  discountReason?: string
  comment?: string
  heardAboutUs?: string
  preferredTime?: StudentPreferredTime
  preferredDays?: WeekDay[]
  passportSeries?: string
  passportNumber?: string
  jshshir?: string
  status?: LeadStatus
  groupIds?: number[]
  centerId?: number
  followUpDate?: string // "YYYY-MM-DD"
}
