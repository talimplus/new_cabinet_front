import { http } from '@/shared/api/http'
import type {
  PendingReceiptsParams,
  PendingReceiptsResponse,
} from '../interfaces/pending-receipts-params.interface'
import type { ReceiptsStatsResponse } from '../interfaces/receipts-stats.interface'
import type {
  ConfirmReceiptsForm,
  ConfirmReceiptsResponse,
} from '../interfaces/confirm-receipts.interface'

export async function fetchPendingReceipts(
  params: PendingReceiptsParams,
): Promise<PendingReceiptsResponse> {
  const { data } = await http.get<PendingReceiptsResponse>('/payments/pending-receipts', {
    params,
  })
  return data
}

/**
 * GET /payments/receipts-stats — the same filters as the list, so the cards and
 * the table can never disagree.
 */
export async function fetchReceiptsStats(
  params: PendingReceiptsParams,
): Promise<ReceiptsStatsResponse> {
  const { data } = await http.get<ReceiptsStatsResponse>('/payments/receipts-stats', { params })
  return data
}

/** PUT /payments/confirm-receipt/:id — approves the receipt (no body). */
export async function confirmReceipt(id: number): Promise<void> {
  await http.put(`/payments/confirm-receipt/${id}`)
}

/** PUT /payments/reject-receipt/:id — the money never entered the till. */
export async function rejectReceipt(id: number, reason?: string): Promise<void> {
  await http.put(`/payments/reject-receipt/${id}`, { reason })
}

/** PUT /payments/confirm-receipts — a selection, or everything the filters match. */
export async function confirmReceipts(
  form: ConfirmReceiptsForm,
): Promise<ConfirmReceiptsResponse> {
  const { data } = await http.put<ConfirmReceiptsResponse>('/payments/confirm-receipts', form)
  return data
}
