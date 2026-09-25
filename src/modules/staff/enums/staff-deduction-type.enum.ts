/** Why a deduction was written. Grouping only — the amount is what matters. */
export enum StaffDeductionType {
  LATE = 'late',
  UNSETTLED_PAYMENT = 'unsettled_payment',
  OTHER = 'other',
}

export const DEDUCTION_TYPE_LABEL_KEYS: Record<StaffDeductionType, string> = {
  [StaffDeductionType.LATE]: 'staff.deductionType.late',
  [StaffDeductionType.UNSETTLED_PAYMENT]: 'staff.deductionType.unsettled_payment',
  [StaffDeductionType.OTHER]: 'staff.deductionType.other',
}
