import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { usePendingReceipts } from '../use-pending-receipts'
import {
  fetchPendingReceipts as fetchPendingReceiptsApi,
  fetchReceiptsStats as fetchReceiptsStatsApi,
  confirmReceipt as confirmReceiptApi,
  rejectReceipt as rejectReceiptApi,
  confirmReceipts as confirmReceiptsApi,
} from '../../api/pending-receipts.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { BulkConfirmMode } from '../../enums/bulk-confirm-mode.enum'
import { emptyReceiptsStats } from '../../interfaces/receipts-stats.interface'
import { t } from '@/locales'
import type { PendingReceipt } from '../../interfaces/pending-receipt.interface'
import type { ConfirmReceiptsResponse } from '../../interfaces/confirm-receipts.interface'

import type * as PendingReceiptsApiModule from '../../api/pending-receipts.api'

type PendingReceiptsApi = typeof PendingReceiptsApiModule

vi.mock('../../api/pending-receipts.api', () => ({
  fetchPendingReceipts: vi.fn<PendingReceiptsApi['fetchPendingReceipts']>(),
  fetchReceiptsStats: vi.fn<PendingReceiptsApi['fetchReceiptsStats']>(),
  confirmReceipt: vi.fn<PendingReceiptsApi['confirmReceipt']>(),
  rejectReceipt: vi.fn<PendingReceiptsApi['rejectReceipt']>(),
  confirmReceipts: vi.fn<PendingReceiptsApi['confirmReceipts']>(),
}))

const mockedFetch = vi.mocked(fetchPendingReceiptsApi)
const mockedStats = vi.mocked(fetchReceiptsStatsApi)
const mockedConfirm = vi.mocked(confirmReceiptApi)
const mockedReject = vi.mocked(rejectReceiptApi)
const mockedConfirmBulk = vi.mocked(confirmReceiptsApi)

function makeReceipt(overrides: Partial<PendingReceipt> = {}): PendingReceipt {
  return {
    id: 1,
    paymentId: 11,
    amount: '250000',
    receivedById: 2,
    receivedAt: '2025-09-01T10:00:00Z',
    confirmedById: null,
    confirmedAt: null,
    status: ReceiptStatus.PENDING,
    comment: null,
    createdAt: '2025-09-01T10:00:00Z',
    payment: {
      id: 11,
      studentId: 5,
      groupId: 3,
      forMonth: '2025-09',
      student: { firstName: 'Ali', lastName: 'Valiyev' },
      group: { name: 'Ingliz A1' },
    },
    ...overrides,
  }
}

function makeBulkResult(overrides: Partial<ConfirmReceiptsResponse> = {}): ConfirmReceiptsResponse {
  return {
    requested: 2,
    confirmedCount: 2,
    confirmedAmount: 101000,
    skippedCount: 0,
    failedCount: 0,
    confirmed: [
      { receiptId: 1, amount: 50000, checkNo: 'CHK-001' },
      { receiptId: 2, amount: 51000, checkNo: 'CHK-002' },
    ],
    skipped: [],
    failed: [],
    ...overrides,
  }
}

describe('usePendingReceipts', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      data: [makeReceipt()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 2 },
    })
    mockedStats.mockResolvedValue(emptyReceiptsStats())
    mockedConfirm.mockResolvedValue(undefined)
    mockedReject.mockResolvedValue(undefined)
    mockedConfirmBulk.mockResolvedValue(makeBulkResult())
  })

  describe('load()', () => {
    it('sends page/perPage only when no date filters are set', async () => {
      const r = usePendingReceipts()
      await r.load()

      expect(mockedFetch).toHaveBeenCalledWith({ page: 1, perPage: 10 })
    })

    it('sends dateFrom/dateTo as YYYY-MM-DD when the Date filters are set', async () => {
      const r = usePendingReceipts()
      r.filters.dateFrom = new Date(2025, 8, 1) // Sep 1, 2025 (local)
      r.filters.dateTo = new Date(2025, 8, 30)

      await r.load()

      expect(mockedFetch).toHaveBeenCalledWith({
        dateFrom: '2025-09-01',
        dateTo: '2025-09-30',
        page: 1,
        perPage: 10,
      })
    })

    it('fills pendingTotal from meta.total and pendingTotalAmount from meta.totalAmount', async () => {
      mockedFetch.mockResolvedValueOnce({
        data: [makeReceipt({ amount: '10000' }), makeReceipt({ id: 2, amount: '20000' })],
        meta: { total: 7, page: 1, perPage: 10, totalPages: 1, totalAmount: 999999 },
      })
      const r = usePendingReceipts()

      await r.load()

      expect(r.pendingTotal.value).toBe(7)
      expect(r.pendingTotalAmount.value).toBe(999999)
    })

    it('falls back to summing the page amounts when meta.totalAmount is absent', async () => {
      mockedFetch.mockResolvedValueOnce({
        data: [makeReceipt({ amount: '10000' }), makeReceipt({ id: 2, amount: '20000.5' })],
        meta: { total: 2, page: 1, perPage: 10, totalPages: 1 },
      })
      const r = usePendingReceipts()

      await r.load()

      expect(r.pendingTotalAmount.value).toBe(30000.5)
    })

    it('resets to page 1 when the current page is past totalPages', async () => {
      mockedFetch.mockResolvedValueOnce({
        data: [makeReceipt()],
        meta: { total: 1, page: 3, perPage: 10, totalPages: 1 },
      })
      const r = usePendingReceipts()
      r.filters.page = 3

      await r.load()

      expect(r.filters.page).toBe(1)
    })
  })

  describe('reload() / init()', () => {
    it('reload() loads the list and the stats with the same filter params', async () => {
      const r = usePendingReceipts()
      r.filters.dateFrom = new Date(2025, 8, 1)
      r.filters.dateTo = new Date(2025, 8, 30)

      await r.reload()

      expect(mockedFetch).toHaveBeenCalledWith({
        dateFrom: '2025-09-01',
        dateTo: '2025-09-30',
        page: 1,
        perPage: 10,
      })
      expect(mockedStats).toHaveBeenCalledWith({ dateFrom: '2025-09-01', dateTo: '2025-09-30' })
    })

    it('init() resets to page 1 then loads the list and the stats', async () => {
      const r = usePendingReceipts()
      r.filters.page = 5

      await r.init()

      expect(r.filters.page).toBe(1)
      expect(mockedFetch).toHaveBeenCalled()
      expect(mockedStats).toHaveBeenCalled()
    })
  })

  describe('applyFilters()', () => {
    it('notifies an error and does not call the api when dateFrom is after dateTo', async () => {
      const r = usePendingReceipts()
      r.filters.dateFrom = new Date(2025, 8, 30)
      r.filters.dateTo = new Date(2025, 8, 1)

      r.applyFilters()
      await flushPromises()

      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.ERROR,
          message: t('pendingReceipts.filters.invalidRange'),
        }),
      )
      expect(mockedFetch).not.toHaveBeenCalled()
      expect(mockedStats).not.toHaveBeenCalled()
    })

    it('resets the page to 1 and clears the selection', async () => {
      const r = usePendingReceipts()
      await r.load()
      r.selection.toggle(r.rows.value[0]!)
      r.filters.page = 3
      expect(r.selection.count.value).toBe(1)

      r.applyFilters()
      await flushPromises()

      expect(r.filters.page).toBe(1)
      expect(r.selection.count.value).toBe(0)
    })
  })

  describe('resetFilters()', () => {
    it('nulls both dates and reloads', async () => {
      const r = usePendingReceipts()
      r.filters.dateFrom = new Date(2025, 8, 1)
      r.filters.dateTo = new Date(2025, 8, 30)
      vi.clearAllMocks()
      mockedFetch.mockResolvedValue({
        data: [makeReceipt()],
        meta: { total: 1, page: 1, perPage: 10, totalPages: 1 },
      })
      mockedStats.mockResolvedValue(emptyReceiptsStats())

      r.resetFilters()
      await flushPromises()

      expect(r.filters.dateFrom).toBeNull()
      expect(r.filters.dateTo).toBeNull()
      expect(mockedFetch).toHaveBeenCalledWith({ page: 1, perPage: 10 })
      expect(mockedStats).toHaveBeenCalledWith({})
    })
  })

  describe('confirm()', () => {
    it('confirms the dialog receipt, notifies success, closes, deselects and reloads', async () => {
      const r = usePendingReceipts()
      const receipt = makeReceipt({ id: 9 })
      r.selection.toggle(receipt)
      r.openConfirm(receipt)
      expect(r.confirmDialog.open).toBe(true)

      await r.confirm()
      await flushPromises()

      expect(mockedConfirm).toHaveBeenCalledWith(9)
      expect(r.confirmDialog.open).toBe(false)
      expect(r.selection.isSelected(9)).toBe(false)
      expect(mockedFetch).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('pendingReceipts.confirmSuccess'),
        }),
      )
    })
  })

  describe('reject()', () => {
    it('sends the trimmed reason, notifies success, closes, deselects and reloads', async () => {
      const r = usePendingReceipts()
      const receipt = makeReceipt({ id: 12 })
      r.selection.toggle(receipt)
      r.openReject(receipt)
      r.rejectReason.value = '  Noto‘g‘ri summa  '

      await r.reject()
      await flushPromises()

      expect(mockedReject).toHaveBeenCalledWith(12, 'Noto‘g‘ri summa')
      expect(r.rejectDialog.open).toBe(false)
      expect(r.selection.isSelected(12)).toBe(false)
      expect(mockedFetch).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('pendingReceipts.rejectSuccess'),
        }),
      )
    })

    it('sends undefined when the reason is blank/whitespace', async () => {
      const r = usePendingReceipts()
      const receipt = makeReceipt({ id: 13 })
      r.openReject(receipt)
      r.rejectReason.value = '   '

      await r.reject()
      await flushPromises()

      expect(mockedReject).toHaveBeenCalledWith(13, undefined)
    })
  })

  describe('openBulk()', () => {
    it('SELECTED with an empty selection notifies an error and does not open the dialog', () => {
      const r = usePendingReceipts()

      r.openBulk(BulkConfirmMode.SELECTED)

      expect(r.bulkDialog.open).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.ERROR,
          message: t('pendingReceipts.bulk.nothingSelected'),
        }),
      )
    })

    it('ALL opens even with an empty selection', () => {
      const r = usePendingReceipts()

      r.openBulk(BulkConfirmMode.ALL)

      expect(r.bulkDialog.open).toBe(true)
      expect(r.bulkDialog.mode).toBe(BulkConfirmMode.ALL)
    })
  })

  describe('confirmBulk()', () => {
    it('SELECTED mode sends { receiptIds }', async () => {
      const r = usePendingReceipts()
      await r.load()
      r.selection.toggle(r.rows.value[0]!)
      r.openBulk(BulkConfirmMode.SELECTED)

      await r.confirmBulk()
      await flushPromises()

      expect(mockedConfirmBulk).toHaveBeenCalledWith({ receiptIds: r.rows.value.map((row) => row.id) })
    })

    it('ALL mode sends { all: true, dateFrom, dateTo } — the active filters ride along', async () => {
      const r = usePendingReceipts()
      r.filters.dateFrom = new Date(2025, 8, 1)
      r.filters.dateTo = new Date(2025, 8, 30)
      r.openBulk(BulkConfirmMode.ALL)

      await r.confirmBulk()
      await flushPromises()

      expect(mockedConfirmBulk).toHaveBeenCalledWith({
        all: true,
        dateFrom: '2025-09-01',
        dateTo: '2025-09-30',
      })
    })

    it('all confirmed, no problems -> SUCCESS notification', async () => {
      mockedConfirmBulk.mockResolvedValueOnce(
        makeBulkResult({ confirmedCount: 2, skippedCount: 0, failedCount: 0 }),
      )
      const r = usePendingReceipts()
      r.openBulk(BulkConfirmMode.ALL)

      await r.confirmBulk()
      await flushPromises()

      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
      expect(notify.items.some((n) => n.type === NotificationType.WARNING)).toBe(false)
      expect(notify.items.some((n) => n.type === NotificationType.ERROR)).toBe(false)
    })

    it('skipped/failed > 0 with confirmedCount > 0 -> WARNING notification', async () => {
      mockedConfirmBulk.mockResolvedValueOnce(
        makeBulkResult({ confirmedCount: 1, skippedCount: 1, failedCount: 0 }),
      )
      const r = usePendingReceipts()
      r.openBulk(BulkConfirmMode.ALL)

      await r.confirmBulk()
      await flushPromises()

      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.WARNING)).toBe(true)
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(false)
    })

    it('confirmedCount === 0 -> ERROR notification', async () => {
      mockedConfirmBulk.mockResolvedValueOnce(
        makeBulkResult({ confirmedCount: 0, skippedCount: 2, failedCount: 0 }),
      )
      const r = usePendingReceipts()
      r.openBulk(BulkConfirmMode.ALL)

      await r.confirmBulk()
      await flushPromises()

      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.ERROR,
          message: t('pendingReceipts.bulk.nothingConfirmed'),
        }),
      )
    })

    it('always closes the dialog and clears the selection', async () => {
      const r = usePendingReceipts()
      await r.load()
      r.selection.toggle(r.rows.value[0]!)
      r.openBulk(BulkConfirmMode.SELECTED)

      await r.confirmBulk()
      await flushPromises()

      expect(r.bulkDialog.open).toBe(false)
      expect(r.selection.count.value).toBe(0)
    })
  })
})
