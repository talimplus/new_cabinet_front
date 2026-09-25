import type { PaymentStatus } from '../enums/payment-status.enum'

/** Query params for GET /payments and GET /payments/export (export drops page/perPage). */
export interface PaymentsParams {
  centerId?: number
  page?: number
  perPage?: number
  status?: PaymentStatus
  forMonth?: string
  overdueOnly?: boolean
  studentId?: number
  groupId?: number
  teacherId?: number
  /**
   * Range filter (`YYYY-MM-DD` or `YYYY-MM`), matched against the payment's
   * month — a mid-month date still covers that whole month. Both are optional.
   */
  dateFrom?: string
  dateTo?: string
  search?: string
}
