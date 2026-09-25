import { http } from '@/shared/api/http'
import type { Payment } from '../interfaces/payment.interface'
import type { PaymentsParams } from '../interfaces/payment-params.interface'
import type {
  MarkAsPaidForm,
  PayPartialForm,
  PaymentCalculateForm,
  UpdatePaymentForm,
} from '../interfaces/payment-form.interface'
import type { PaymentCalculationResponse } from '../interfaces/payment-calculation.interface'
import type {
  PaymentActionResponse,
  PaymentCheck,
  PaymentReceiptsResponse,
} from '@/shared/interfaces/payment-check.interface'
import type {
  ExclusionForm,
  ExclusionPreviewResponse,
} from '../interfaces/payment-exclusion.interface'
import type { PaginatedResponse } from '@/shared/interfaces/paginated.interface'

export interface PaymentsExportFile {
  blob: Blob
  filename: string
}

export async function fetchPayments(
  params: PaymentsParams,
): Promise<PaginatedResponse<Payment>> {
  const { data } = await http.get<PaginatedResponse<Payment>>('/payments', { params })
  return data
}

/**
 * Pull the file name out of Content-Disposition. The backend sends
 * `filename="…"`; RFC 5987 (`filename*=UTF-8''…`) is handled too.
 */
export function parseFilename(disposition?: string): string | null {
  if (!disposition) return null
  const utf8 = /filename\*=\s*UTF-8''([^;]+)/i.exec(disposition)
  if (utf8?.[1]) {
    try {
      return decodeURIComponent(utf8[1].trim())
    } catch {
      return utf8[1].trim()
    }
  }
  return /filename\s*=\s*"?([^";]+)"?/i.exec(disposition)?.[1]?.trim() || null
}

/**
 * GET /payments/export — the list's filters without pagination, as .xlsx.
 * The name comes from the response header (CORS exposes Content-Disposition).
 */
export async function exportPayments(params: PaymentsParams): Promise<PaymentsExportFile> {
  const response = await http.get<Blob>('/payments/export', { params, responseType: 'blob' })
  const fallback = `tolovlar_${new Date().toISOString().slice(0, 10)}.xlsx`
  return {
    blob: response.data,
    filename: parseFilename(response.headers['content-disposition'] as string) ?? fallback,
  }
}

/** PUT /payments/mark-as-paid/{id} — pays off the whole remaining amount. */
export async function markAsPaid(
  id: number,
  body?: MarkAsPaidForm,
): Promise<PaymentActionResponse> {
  const { data } = await http.put<PaymentActionResponse>(
    `/payments/mark-as-paid/${id}`,
    body ?? {},
  )
  return data
}

/** PUT /payments/pay-partial/{id} — records a partial payment. */
export async function payPartial(
  id: number,
  body: PayPartialForm,
): Promise<PaymentActionResponse> {
  const { data } = await http.put<PaymentActionResponse>(`/payments/pay-partial/${id}`, body)
  return data
}

/** PUT /payments/calculate/{id} — recomputes the amount for a stop-study date. */
export async function calculatePayment(
  id: number,
  body: PaymentCalculateForm,
): Promise<PaymentCalculationResponse> {
  const { data } = await http.put<PaymentCalculationResponse>(
    `/payments/calculate/${id}`,
    body,
  )
  return data
}

/** PUT /payments/{id} — updates the planned study-until date. */
export async function updatePayment(id: number, body: UpdatePaymentForm): Promise<void> {
  await http.put(`/payments/${id}`, body)
}

/** PUT /payments/preview-exclusion/{id} — computes a write-off without storing it. */
export async function previewExclusion(
  id: number,
  body: ExclusionForm,
): Promise<ExclusionPreviewResponse> {
  const { data } = await http.put<ExclusionPreviewResponse>(
    `/payments/preview-exclusion/${id}`,
    body,
  )
  return data
}

/** PUT /payments/apply-exclusion/{id} — stores it (amountDue drops). `comment` is required. */
export async function applyExclusion(id: number, body: ExclusionForm): Promise<void> {
  await http.put(`/payments/apply-exclusion/${id}`, body)
}

/** GET /payments/{paymentId}/receipts — every receipt of that month, print-ready. */
export async function fetchPaymentReceipts(paymentId: number): Promise<PaymentCheck[]> {
  const { data } = await http.get<PaymentReceiptsResponse>(`/payments/${paymentId}/receipts`)
  return data?.data ?? []
}

/** GET /payments/receipt/{receiptId}/check — re-print a single receipt later. */
export async function fetchReceiptCheck(receiptId: number): Promise<PaymentCheck> {
  const { data } = await http.get<PaymentCheck>(`/payments/receipt/${receiptId}/check`)
  return data
}
