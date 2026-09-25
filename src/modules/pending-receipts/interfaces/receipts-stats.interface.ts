export interface ReceiptsStatsBucket {
  count: number
  amount: number
}

/**
 * GET /payments/receipts-stats — money handed to the center, by receipt state.
 * `total = confirmed + pending`; rejected money never reached the till, so it
 * is reported separately and NOT added in.
 */
export interface ReceiptsStatsResponse {
  confirmed: ReceiptsStatsBucket
  pending: ReceiptsStatsBucket
  rejected: ReceiptsStatsBucket
  total: ReceiptsStatsBucket
}

export function emptyReceiptsStats(): ReceiptsStatsResponse {
  const empty = (): ReceiptsStatsBucket => ({ count: 0, amount: 0 })
  return { confirmed: empty(), pending: empty(), rejected: empty(), total: empty() }
}
