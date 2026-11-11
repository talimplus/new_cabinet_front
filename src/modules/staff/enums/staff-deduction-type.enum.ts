/** Why a deduction was written. Grouping only — the amount is what matters. */
export enum StaffDeductionType {
  LATE = 'late',
  UNSETTLED_PAYMENT = 'unsettled_payment',
  OTHER = 'other',
  /**
   * An advance (avans) handed out before payday. Stored as a deduction so it
   * comes off the salary FIFO like a fine, but it is NOT a fine: it is created
   * via `POST /staff/advances` and never offered in the fine dialogs.
   */
  ADVANCE = 'advance',
}

export const DEDUCTION_TYPE_LABEL_KEYS: Record<StaffDeductionType, string> = {
  [StaffDeductionType.LATE]: 'staff.deductionType.late',
  [StaffDeductionType.UNSETTLED_PAYMENT]: 'staff.deductionType.unsettled_payment',
  [StaffDeductionType.OTHER]: 'staff.deductionType.other',
  [StaffDeductionType.ADVANCE]: 'staff.deductionType.advance',
}

/** The types an admin may pick when writing a fine (`POST /staff/deductions` rejects advance). */
export const FINE_DEDUCTION_TYPES: StaffDeductionType[] = [
  StaffDeductionType.LATE,
  StaffDeductionType.UNSETTLED_PAYMENT,
  StaffDeductionType.OTHER,
]
