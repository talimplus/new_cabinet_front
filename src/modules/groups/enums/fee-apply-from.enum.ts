/**
 * When a changed group fee takes effect. Sent only on edit (PUT /groups) when the
 * price actually changed. Omitted → backend defaults to `next_month`.
 */
export enum FeeApplyFrom {
  /** Fix a wrongly-entered price: recompute THIS month's unpaid/partial payments. */
  CURRENT_MONTH = 'current_month',
  /** Normal price change: the new price is active from next month only. */
  NEXT_MONTH = 'next_month',
}
