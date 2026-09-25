import { computed, reactive, ref } from 'vue'
import {
  fetchPendingReceipts,
  fetchReceiptsStats,
  confirmReceipt,
  confirmReceipts,
  rejectReceipt,
} from '../api/pending-receipts.api'
import { useReceiptSelection } from './use-receipt-selection'
import { optionalRequest } from '@/shared/permissions/optional-request'
import { useScopeStore } from '@/stores/scope.store'
import { useNotificationStore } from '@/stores/notification.store'
import { toDateString } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import { BulkConfirmMode } from '../enums/bulk-confirm-mode.enum'
import { emptyReceiptsStats } from '../interfaces/receipts-stats.interface'
import type { PendingReceipt } from '../interfaces/pending-receipt.interface'
import type { PendingReceiptsParams } from '../interfaces/pending-receipts-params.interface'
import type { ConfirmReceiptsForm } from '../interfaces/confirm-receipts.interface'
import { t } from '@/locales'

interface ReceiptFilters {
  dateFrom: Date | null
  dateTo: Date | null
  page: number
  perPage: number
}

interface ReceiptDialogState {
  open: boolean
  receipt: PendingReceipt | null
}

interface BulkDialogState {
  open: boolean
  mode: BulkConfirmMode
}

/** List/state logic for the admin pending-receipts page. */
export function usePendingReceipts() {
  const scope = useScopeStore()
  const notify = useNotificationStore()

  const rows = ref<PendingReceipt[]>([])
  const totalPages = ref(1)
  /** Everything the filters match — what "confirm all" is really about. */
  const pendingTotal = ref(0)
  const pendingTotalAmount = ref(0)
  const loading = ref(false)
  const processing = ref(false)
  const stats = ref(emptyReceiptsStats())
  const statsLoading = ref(false)

  const filters = reactive<ReceiptFilters>({
    dateFrom: null,
    dateTo: null,
    page: 1,
    perPage: 10,
  })

  const selection = useReceiptSelection(() => rows.value)

  const confirmDialog = reactive<ReceiptDialogState>({ open: false, receipt: null })
  const rejectDialog = reactive<ReceiptDialogState>({ open: false, receipt: null })
  const rejectReason = ref('')
  const bulkDialog = reactive<BulkDialogState>({
    open: false,
    mode: BulkConfirmMode.SELECTED,
  })

  const hasFilters = computed(() => !!(filters.dateFrom || filters.dateTo))

  /** The one filter state the list, the stat cards and "confirm all" all share. */
  function filterParams(): PendingReceiptsParams {
    return {
      dateFrom: filters.dateFrom ? toDateString(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? toDateString(filters.dateTo) : undefined,
    }
  }

  async function load(): Promise<void> {
    loading.value = true
    try {
      const { data, meta } = await fetchPendingReceipts({
        ...filterParams(),
        page: filters.page,
        perPage: filters.perPage,
      })
      rows.value = data
      totalPages.value = meta.totalPages ?? 1
      pendingTotal.value = meta.total ?? data.length
      pendingTotalAmount.value =
        meta.totalAmount ?? data.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0)
      // A deleted last page would otherwise leave the admin on an empty one.
      if (filters.page > totalPages.value) filters.page = 1
    } finally {
      loading.value = false
    }
  }

  async function loadStats(): Promise<void> {
    statsLoading.value = true
    try {
      // The cards are decoration — a user without the key still gets the table.
      stats.value = await optionalRequest(fetchReceiptsStats(filterParams()), emptyReceiptsStats())
    } finally {
      statsLoading.value = false
    }
  }

  async function reload(): Promise<void> {
    await Promise.all([load(), loadStats()])
  }

  async function init(): Promise<void> {
    filters.page = 1
    await reload()
  }

  function applyFilters(): void {
    const from = filters.dateFrom ? toDateString(filters.dateFrom) : ''
    const to = filters.dateTo ? toDateString(filters.dateTo) : ''
    if (from && to && from > to) {
      notify.error(t('pendingReceipts.filters.invalidRange'))
      return
    }
    filters.page = 1
    selection.clear()
    reload()
  }

  function resetFilters(): void {
    filters.dateFrom = null
    filters.dateTo = null
    applyFilters()
  }

  function setPage(page: number): void {
    filters.page = page
    load()
  }

  function openConfirm(receipt: PendingReceipt): void {
    confirmDialog.receipt = receipt
    confirmDialog.open = true
  }

  function openReject(receipt: PendingReceipt): void {
    rejectDialog.receipt = receipt
    rejectReason.value = ''
    rejectDialog.open = true
  }

  function openBulk(mode: BulkConfirmMode): void {
    if (mode === BulkConfirmMode.SELECTED && selection.count.value === 0) {
      notify.error(t('pendingReceipts.bulk.nothingSelected'))
      return
    }
    bulkDialog.mode = mode
    bulkDialog.open = true
  }

  async function confirm(): Promise<void> {
    if (!confirmDialog.receipt) return
    const id = confirmDialog.receipt.id
    processing.value = true
    try {
      await confirmReceipt(id)
      notify.success(t('pendingReceipts.confirmSuccess'))
      confirmDialog.open = false
      selection.remove(id)
      await reload()
    } finally {
      processing.value = false
    }
  }

  async function reject(): Promise<void> {
    if (!rejectDialog.receipt) return
    const id = rejectDialog.receipt.id
    processing.value = true
    try {
      await rejectReceipt(id, rejectReason.value.trim() || undefined)
      notify.success(t('pendingReceipts.rejectSuccess'))
      rejectDialog.open = false
      selection.remove(id)
      await reload()
    } finally {
      processing.value = false
    }
  }

  async function confirmBulk(): Promise<void> {
    // `all` carries the filters so the backend confirms exactly the rows the
    // admin is looking at — never the whole table behind their back.
    const form: ConfirmReceiptsForm =
      bulkDialog.mode === BulkConfirmMode.ALL
        ? { all: true, ...filterParams() }
        : { receiptIds: selection.ids.value }

    processing.value = true
    try {
      const result = await confirmReceipts(form)
      if (result.confirmedCount > 0) {
        const problems = result.skippedCount > 0 || result.failedCount > 0
        const message = problems
          ? t('pendingReceipts.bulk.partial', {
              count: result.confirmedCount,
              skipped: result.skippedCount,
              failed: result.failedCount,
            })
          : t('pendingReceipts.bulk.success', {
              count: result.confirmedCount,
              amount: formatSom(result.confirmedAmount),
            })
        if (problems) notify.warning(message)
        else notify.success(message)
      } else {
        notify.error(t('pendingReceipts.bulk.nothingConfirmed'))
      }
      bulkDialog.open = false
      selection.clear()
      await reload()
    } finally {
      processing.value = false
    }
  }

  return {
    scope, rows, totalPages, pendingTotal, pendingTotalAmount, loading, processing,
    stats, statsLoading, filters, hasFilters, selection,
    confirmDialog, rejectDialog, rejectReason, bulkDialog,
    init, load, reload, applyFilters, resetFilters, setPage,
    openConfirm, confirm, openReject, reject, openBulk, confirmBulk,
  }
}
