import type { StaffDeductionType } from '@/modules/staff/enums/staff-deduction-type.enum'

/** Optional fine written together with (or instead of) a salary payment. */
export interface PayStaffDeductionForm {
  amount: number
  reason: string
  type: StaffDeductionType
}

/**
 * Request body for `PUT /staff-salaries/pay/{id}`. `amount` may be 0 when the
 * admin is only writing a fine — the backend accepts that.
 */
export interface PayStaffSalaryForm {
  amount: number
  comment?: string
  deduction?: PayStaffDeductionForm
}
