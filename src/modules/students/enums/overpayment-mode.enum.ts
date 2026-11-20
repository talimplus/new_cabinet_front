/**
 * What happens to money paid above the new amount when a personal price is
 * dropped from a paid month (`POST /students/:id/personal-fee/clear` → `overpayment`).
 */
export enum OverpaymentMode {
  /** Given back to the student (`refundedAmount`, leaves the till). */
  REFUND = 'refund',
  /** Moved to the next months (`creditAmount` → transfer receipt). */
  CARRY = 'carry',
}

export const OVERPAYMENT_MODE_LABEL_KEYS: Record<OverpaymentMode, string> = {
  [OverpaymentMode.REFUND]: 'students.personalFee.overpayment.refund',
  [OverpaymentMode.CARRY]: 'students.personalFee.overpayment.carry',
}
