import type { Payment } from '../interfaces/payment.interface'
import type { ExclusionState } from '../interfaces/payment-exclusion.interface'

/** DECIMAL columns arrive as strings — normalise before doing maths or formatting. */
export function toAmount(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(n) ? 0 : n
}

/**
 * What is still collectable FROM THE STUDENT: `amountDue − (amountPaid + pendingAmount)`.
 *
 * `remainingAmount` is the cash-desk debt and still counts money that reception
 * has already taken but an admin has not confirmed — showing it would bill the
 * student twice. The backend gives `payableNow` directly; older rows fall back.
 */
export function payableNow(payment: Payment | null | undefined): number {
  if (!payment) return 0
  if (payment.payableNow != null) return payment.payableNow
  return Math.max(0, payment.remainingAmount - (payment.pendingAmount ?? 0))
}

/**
 * The collectable amount once a pending write-off is applied. The preview's
 * `newRemaining` is again a cash-desk figure, so unconfirmed money comes off it.
 */
export function payableAfterExclusion(
  payment: Payment | null,
  exclusion: ExclusionState,
): number {
  if (exclusion.active && exclusion.preview) {
    return Math.max(0, exclusion.preview.newRemaining - (payment?.pendingAmount ?? 0))
  }
  return payableNow(payment)
}

/** The history button only makes sense once money has actually been taken. */
export function hasReceipts(payment: Payment): boolean {
  return toAmount(payment.amountPaid) > 0 || !!payment.hasPendingReceipt
}
