import { computed, ref } from 'vue'
import { payStudentDebt } from '../api/student-card.api'
import { useReceptionForm } from '@/shared/composables/use-reception-form'
import { formatSom } from '@/shared/utils/format-money'
import { useNotificationStore } from '@/stores/notification.store'
import type { StudentPaymentSummary, StudentSummaryMonth } from '../interfaces/student-summary.interface'
import type { DebtAllocation } from '../interfaces/pay-debt.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'
import { t } from '@/locales'

/**
 * The "pay the whole debt" flow. One amount goes in; the backend spreads it
 * over the open months oldest-first and answers with the refreshed summary plus
 * one receipt per month it touched.
 */
export function usePayDebt(
  studentId: () => number | null,
  months: () => StudentSummaryMonth[],
  payableNow: () => number,
) {
  const notify = useNotificationStore()
  const open = ref(false)
  const loading = ref(false)
  const amount = ref<number | null>(null)
  const reception = useReceptionForm()
  /** Receipts from the last successful payment — one per month it covered. */
  const checks = ref<PaymentCheck[]>([])
  const checksOpen = ref(false)

  const error = computed(() => {
    const value = amount.value
    if (value == null || Number.isNaN(value) || value <= 0) {
      return t('students.view.validation.min')
    }
    if (value > payableNow()) {
      return t('students.view.validation.max', { amount: formatSom(payableNow()) })
    }
    return ''
  })
  const valid = computed(() => !error.value && payableNow() > 0)

  /**
   * Mirrors the backend's allocation so the cashier sees where the money lands
   * BEFORE confirming. `months` arrives newest-first, hence the reverse.
   */
  const allocation = computed<DebtAllocation[]>(() => {
    let left = Number(amount.value) || 0
    if (left <= 0) return []
    const rows: DebtAllocation[] = []
    for (const month of [...months()].reverse()) {
      if (left <= 0) break
      const due = month.payableNow
      if (due <= 0) continue
      const allocated = Math.min(left, due)
      rows.push({ forMonth: month.forMonth, groupName: month.groupName, allocated })
      left -= allocated
    }
    return rows
  })

  function openModal(): void {
    amount.value = payableNow()
    reception.reset()
    open.value = true
  }

  function close(): void {
    if (!loading.value) open.value = false
  }

  /** Resolves with the refreshed summary, or `null` when nothing was paid. */
  async function submit(): Promise<StudentPaymentSummary | null> {
    const id = studentId()
    if (!id || !valid.value) return null
    loading.value = true
    try {
      const summary = await payStudentDebt(id, {
        amount: amount.value ?? undefined,
        ...reception.toForm(),
      })
      notify.success(t('students.view.messages.paySuccess'))
      open.value = false
      // The receipts pop up straight away — that is what the parent walks off with.
      checks.value = summary.checks ?? []
      checksOpen.value = checks.value.length > 0
      return summary
    } catch {
      // Toasted by the interceptor; the modal stays open so it can be retried.
      return null
    } finally {
      loading.value = false
    }
  }

  function closeChecks(): void {
    checksOpen.value = false
    checks.value = []
  }

  return {
    open, loading, amount, reception, error, valid, allocation, checks, checksOpen,
    openModal, close, submit, closeChecks,
  }
}
