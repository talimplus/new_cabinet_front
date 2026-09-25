import { reactive, ref } from 'vue'
import { fetchPaymentReceipts } from '../api/payments.api'
import type { Payment } from '../interfaces/payment.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

interface HistoryState {
  open: boolean
  payment: Payment | null
  loading: boolean
  failed: boolean
}

/**
 * The two receipt surfaces of /payments: the check that pops up right after a
 * payment, and the per-month history that can reprint any earlier one.
 */
export function usePaymentChecks() {
  const checks = ref<PaymentCheck[]>([])
  const checksOpen = ref(false)

  const history = reactive<HistoryState>({
    open: false,
    payment: null,
    loading: false,
    failed: false,
  })
  const receipts = ref<PaymentCheck[]>([])

  /** Opens the check modal, skipping receipts the backend did not return. */
  function showChecks(incoming: (PaymentCheck | undefined | null)[]): void {
    const valid = incoming.filter((c): c is PaymentCheck => !!c)
    if (!valid.length) return
    checks.value = valid
    checksOpen.value = true
  }

  function closeChecks(): void {
    checksOpen.value = false
    checks.value = []
  }

  async function loadHistory(): Promise<void> {
    if (!history.payment) return
    history.loading = true
    history.failed = false
    try {
      receipts.value = (await fetchPaymentReceipts(history.payment.id)).filter(Boolean)
    } catch {
      // Toasted by the interceptor; the modal offers a retry.
      receipts.value = []
      history.failed = true
    } finally {
      history.loading = false
    }
  }

  /** Always refetched on open so a payment taken moments ago shows up. */
  function openHistory(payment: Payment): void {
    history.payment = payment
    history.open = true
    receipts.value = []
    loadHistory()
  }

  function closeHistory(): void {
    history.open = false
    history.payment = null
    receipts.value = []
  }

  return {
    checks, checksOpen, showChecks, closeChecks,
    history, receipts, openHistory, closeHistory, loadHistory,
  }
}
