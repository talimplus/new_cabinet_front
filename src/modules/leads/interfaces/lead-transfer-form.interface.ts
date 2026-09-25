import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentPreferredTime } from '@/modules/students/enums/student-preferred-time.enum'
import type { LeadStatus } from '../enums/lead-status.enum'

/** A discount period on the created student (the lead form only sets a flat
 *  percent, so this is always sent empty — see `toTransferPayload`). */
export interface LeadDiscountPeriodForm {
  percent: number
  fromMonth: string
  toMonth?: string | null
  reason?: string
}

/** POST /leads/:id/transfer-to-student body — creates a Student from the lead. */
export interface LeadTransferForm {
  firstName: string
  lastName: string
  phone: string
  secondPhone?: string
  birthDate?: string
  comment?: string
  heardAboutUs?: string
  preferredTime?: StudentPreferredTime
  preferredDays?: WeekDay[]
  passportSeries?: string
  passportNumber?: string
  jshshir?: string
  monthlyFee?: number
  discountPercent?: number
  discountReason?: string
  status?: LeadStatus
  centerId?: number
  groupIds?: number[]
  subjectId?: number
  discountPeriods?: LeadDiscountPeriodForm[]
}
