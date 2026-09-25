import { http } from '@/shared/api/http'
import type { StudentPaymentSummary } from '../interfaces/student-summary.interface'
import type { PayDebtForm } from '../interfaces/pay-debt.interface'
import type { TelegramStudentLink } from '../interfaces/telegram-link.interface'

/**
 * Everything the `/students/:id` card needs beyond plain student CRUD. The
 * money endpoints live under `/payments/...` on the server but are only ever
 * consumed here, so they stay with their screen.
 */

/** GET /payments/student/{id}/summary — profile + totals + one row per month. */
export async function fetchStudentPaymentSummary(
  studentId: number,
): Promise<StudentPaymentSummary> {
  const { data } = await http.get<StudentPaymentSummary>(`/payments/student/${studentId}/summary`)
  return data
}

/**
 * PUT /payments/pay-debt/student/{id} — one amount spread over the open months
 * oldest-first. The response is the refreshed summary plus `checks[]`.
 */
export async function payStudentDebt(
  studentId: number,
  body: PayDebtForm,
): Promise<StudentPaymentSummary> {
  const { data } = await http.put<StudentPaymentSummary>(
    `/payments/pay-debt/student/${studentId}`,
    body,
  )
  return data
}

/** GET /telegram/students/{id}/link — parent deep link, QR and linked chats. */
export async function fetchStudentTelegramLink(
  studentId: number,
): Promise<TelegramStudentLink> {
  const { data } = await http.get<TelegramStudentLink>(`/telegram/students/${studentId}/link`)
  return data
}

/** POST …/link/regenerate — the old QR stops working immediately. */
export async function regenerateStudentTelegramQr(
  studentId: number,
): Promise<TelegramStudentLink> {
  const { data } = await http.post<TelegramStudentLink>(
    `/telegram/students/${studentId}/link/regenerate`,
  )
  return data
}

/** DELETE /telegram/parents/{linkId} — disconnects one parent chat. */
export async function unlinkTelegramParent(linkId: number): Promise<void> {
  await http.delete(`/telegram/parents/${linkId}`)
}
