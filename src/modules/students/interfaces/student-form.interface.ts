import type { WeekDay } from '@/modules/groups/enums/week-day.enum'
import type { StudentStatus } from '../enums/student-status.enum'
import type { StudentPreferredTime } from '../enums/student-preferred-time.enum'

/** One discount period in the create/update body. Months are "YYYY-MM". */
export interface DiscountPeriodForm {
  percent: number
  fromMonth: string
  toMonth?: string
  reason?: string
}

/** POST /students and PUT /students/:id body. */
export interface StudentForm {
  firstName: string
  lastName: string
  phone: string
  secondPhone?: string
  birthDate?: string // "YYYY-MM-DD"
  comment?: string
  heardAboutUs?: string
  preferredTime?: StudentPreferredTime
  preferredDays?: WeekDay[]
  passportSeries?: string
  passportNumber?: string
  jshshir?: string
  referrerId?: number
  monthlyFee?: number
  discountPercent?: number
  discountReason?: string
  discountPeriods?: DiscountPeriodForm[]
  status?: StudentStatus
  centerId?: number
  groupIds?: number[]
  subjectId?: number
}
