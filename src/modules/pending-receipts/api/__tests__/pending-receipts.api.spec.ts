import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPendingReceipts,
  fetchReceiptsStats,
  confirmReceipt,
  rejectReceipt,
  confirmReceipts,
} from '../pending-receipts.api'
import { http } from '@/shared/api/http'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PendingReceiptsResponse } from '../../interfaces/pending-receipts-params.interface'
import type { ReceiptsStatsResponse } from '../../interfaces/receipts-stats.interface'
import type { ConfirmReceiptsResponse } from '../../interfaces/confirm-receipts.interface'
import type { AxiosInstance } from 'axios'

type Http = AxiosInstance

vi.mock('@/shared/api/http', () => ({
  http: {
    get: vi.fn<Http['get']>(),
    post: vi.fn<Http['post']>(),
    put: vi.fn<Http['put']>(),
    delete: vi.fn<Http['delete']>(),
  },
}))

const mockedHttp = vi.mocked(http, true)

describe('pending-receipts.api', () => {
  beforeEach(() => vi.clearAllMocks())

  describe('fetchPendingReceipts', () => {
    it('GETs /payments/pending-receipts with params and returns the paginated body, meta.totalAmount included', async () => {
      const body: PendingReceiptsResponse = {
        data: [
          {
            id: 1,
            paymentId: 10,
            amount: '250000',
            receivedById: 5,
            receivedAt: '2025-09-01T10:00:00.000Z',
            confirmedById: null,
            confirmedAt: null,
            status: ReceiptStatus.PENDING,
            comment: null,
            createdAt: '2025-09-01T10:00:00.000Z',
            payment: {
              id: 10,
              studentId: 20,
              groupId: 30,
              forMonth: '2025-09',
              student: { firstName: 'Ali', lastName: 'Valiyev' },
              group: { name: 'Frontend-1' },
            },
          },
        ],
        meta: { total: 0, page: 1, perPage: 5, totalPages: 0, totalAmount: 0 },
      }
      mockedHttp.get.mockResolvedValueOnce({ data: body })

      const result = await fetchPendingReceipts({ centerId: 3, page: 1, perPage: 5 })

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/pending-receipts', {
        params: { centerId: 3, page: 1, perPage: 5 },
      })
      expect(result).toEqual(body)
      expect(result.meta.totalAmount).toBe(0)
    })

    it('passes dateFrom/dateTo filters straight through as params', async () => {
      mockedHttp.get.mockResolvedValueOnce({
        data: { data: [], meta: { total: 0, page: 1, perPage: 5, totalPages: 0, totalAmount: 0 } },
      })

      await fetchPendingReceipts({ dateFrom: '2025-09-01', dateTo: '2025-09-30' })

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/pending-receipts', {
        params: { dateFrom: '2025-09-01', dateTo: '2025-09-30' },
      })
    })
  })

  describe('fetchReceiptsStats', () => {
    it('GETs /payments/receipts-stats with params and returns the body', async () => {
      const body: ReceiptsStatsResponse = {
        confirmed: { count: 2, amount: 101000 },
        pending: { count: 0, amount: 0 },
        rejected: { count: 0, amount: 0 },
        total: { count: 2, amount: 101000 },
      }
      mockedHttp.get.mockResolvedValueOnce({ data: body })

      const result = await fetchReceiptsStats({ centerId: 3, dateFrom: '2025-09-01', dateTo: '2025-09-30' })

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/receipts-stats', {
        params: { centerId: 3, dateFrom: '2025-09-01', dateTo: '2025-09-30' },
      })
      expect(result).toEqual(body)
    })
  })

  describe('confirmReceipt', () => {
    it('PUTs /payments/confirm-receipt/{id} with no body argument', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: undefined })

      await confirmReceipt(42)

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/confirm-receipt/42')
      expect(mockedHttp.put).toHaveBeenCalledTimes(1)
      expect(mockedHttp.put.mock.calls[0]).toHaveLength(1)
    })
  })

  describe('rejectReceipt', () => {
    it('PUTs /payments/reject-receipt/{id} with { reason }', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: undefined })

      await rejectReceipt(7, 'Noto‘g‘ri summa')

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/reject-receipt/7', {
        reason: 'Noto‘g‘ri summa',
      })
    })

    it('still sends { reason: undefined } when the reason is omitted', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: undefined })

      await rejectReceipt(7)

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/reject-receipt/7', { reason: undefined })
    })
  })

  describe('confirmReceipts', () => {
    const response: ConfirmReceiptsResponse = {
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
    }

    it('PUTs /payments/confirm-receipts with a receiptIds selection and returns the body', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: response })

      const result = await confirmReceipts({ receiptIds: [1, 2] })

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/confirm-receipts', { receiptIds: [1, 2] })
      expect(result).toEqual(response)
    })

    it('PUTs /payments/confirm-receipts with an all:true + date filters form and returns the body', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: response })

      const form = { all: true, dateFrom: '2025-09-01', dateTo: '2025-09-30' }
      const result = await confirmReceipts(form)

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/confirm-receipts', form)
      expect(result).toEqual(response)
    })
  })
})
