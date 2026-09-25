import { http } from './http'
import type {
  TransferForm,
  TransferPreviewForm,
  TransferPreviewRow,
  TransferResponse,
} from '@/shared/interfaces/student-transfer.interface'

/**
 * Moving students between groups. Used from both the student card (one student)
 * and the group detail students tab (bulk), so it lives in `shared/` — a module
 * never imports another module's composables/components.
 */

/** POST /students/transfer/preview — the debt/overpayment each student carries. */
export async function previewTransfer(body: TransferPreviewForm): Promise<TransferPreviewRow[]> {
  const { data } = await http.post<TransferPreviewRow[]>('/students/transfer/preview', body)
  return Array.isArray(data) ? data : []
}

/** POST /students/transfer — moves students between groups and settles the month. */
export async function transferStudents(body: TransferForm): Promise<TransferResponse> {
  const { data } = await http.post<TransferResponse>('/students/transfer', body)
  return data
}
