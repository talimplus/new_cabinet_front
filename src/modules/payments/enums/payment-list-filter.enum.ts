/**
 * Status-filter choices that are NOT a `PaymentStatus` value. UI-only; mapped
 * onto query params in `use-payments` (`pending` → `pendingOnly=true`).
 */
export enum PaymentListFilter {
  ALL = 'all',
  /** Reception took the money, an admin has not confirmed it yet. */
  PENDING = 'pending',
}
