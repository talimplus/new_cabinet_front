import { reactive, ref } from 'vue'
import { exportPayments } from '../api/payments.api'
import { downloadBlob } from '@/shared/utils/download-file'
import { toDateString } from '@/shared/utils/format-date'
import { useNotificationStore } from '@/stores/notification.store'
import { t } from '@/locales'
import type { PaymentsParams } from '../interfaces/payment-params.interface'

interface PeriodState {
  open: boolean
  from: Date | null
  to: Date | null
}

/**
 * The two Excel exports. Both reuse the page's live filters; the month button
 * adds `forMonth`, the period dialog replaces it with a `dateFrom`/`dateTo`
 * range (either bound may be left empty).
 */
export function usePaymentExport(filterParams: (withMonth: boolean) => PaymentsParams) {
  const notify = useNotificationStore()

  const exportingMonth = ref(false)
  const exportingPeriod = ref(false)
  const period = reactive<PeriodState>({ open: false, from: null, to: null })

  /**
   * Resolves `true` only when the file actually arrived. A failure is already
   * toasted by the http interceptor, and these run straight off a click
   * handler — letting the rejection escape would surface as an unhandled
   * promise rejection instead.
   */
  async function download(params: PaymentsParams): Promise<boolean> {
    try {
      const { blob, filename } = await exportPayments(params)
      downloadBlob(blob, filename)
      notify.success(t('payments.messages.exportSuccess'))
      return true
    } catch {
      return false
    }
  }

  async function exportMonth(): Promise<void> {
    exportingMonth.value = true
    try {
      await download(filterParams(true))
    } finally {
      exportingMonth.value = false
    }
  }

  function openPeriod(): void {
    period.open = true
    period.from = null
    period.to = null
  }

  function closePeriod(): void {
    if (exportingPeriod.value) return
    period.open = false
  }

  async function exportPeriod(): Promise<void> {
    const dateFrom = period.from ? toDateString(period.from) : undefined
    const dateTo = period.to ? toDateString(period.to) : undefined
    if (dateFrom && dateTo && dateFrom > dateTo) {
      notify.error(t('payments.messages.exportInvalidRange'))
      return
    }

    exportingPeriod.value = true
    try {
      // The month tab is deliberately dropped — it would squeeze the range
      // back into a single month. The dialog stays open on failure so the
      // dates can be corrected and retried.
      if (await download({ ...filterParams(false), dateFrom, dateTo })) period.open = false
    } finally {
      exportingPeriod.value = false
    }
  }

  return { exportingMonth, exportingPeriod, period, exportMonth, openPeriod, closePeriod, exportPeriod }
}
