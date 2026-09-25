import type { LeadStatus } from '../enums/lead-status.enum'

/** Query params for GET /leads. */
export interface LeadsParams {
  centerId?: number
  name?: string
  phone?: string
  status?: LeadStatus
  groupId?: number
  followUpDate?: string // "YYYY-MM-DD"
  page?: number
  perPage?: number
}
