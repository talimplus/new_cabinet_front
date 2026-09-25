import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchPayments,
  markAsPaid,
  payPartial,
  calculatePayment,
  updatePayment,
  parseFilename,
  exportPayments,
  previewExclusion,
  applyExclusion,
  fetchPaymentReceipts,
  fetchReceiptCheck,
} from '../payments.api'
import { http } from '@/shared/api/http'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PaymentCalculationResponse } from '../../interfaces/payment-calculation.interface'
import type { PaymentCheck, PaymentActionResponse } from '@/shared/interfaces/payment-check.interface'
import type { ExclusionPreviewResponse } from '../../interfaces/payment-exclusion.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('payments.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchPayments GETs /payments with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1 }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchPayments({
      centerId: 3,
      forMonth: '2026-09',
      status: PaymentStatus.UNPAID,
      page: 1,
      perPage: 10,
    })

    expect(mockedHttp.get).toHaveBeenCalledWith('/payments', {
      params: {
        centerId: 3,
        forMonth: '2026-09',
        status: PaymentStatus.UNPAID,
        page: 1,
        perPage: 10,
      },
    })
    expect(result).toEqual(body)
  })

  it('does not include a status key when the UI passes none (all sentinel stripped upstream)', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: { data: [], meta: {} } })

    await fetchPayments({ centerId: 3, forMonth: '2026-09', page: 1, perPage: 10 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/payments', {
      params: { centerId: 3, forMonth: '2026-09', page: 1, perPage: 10 },
    })
    const [, config] = mockedHttp.get.mock.calls[0]!
    expect('status' in (config as { params: object }).params).toBe(false)
  })

  it('markAsPaid PUTs /payments/mark-as-paid/{id} with an empty body by default', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await markAsPaid(7)

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/mark-as-paid/7', {})
  })

  it('markAsPaid forwards an optional body', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await markAsPaid(7, { comment: 'ok', paymentMethod: PaymentMethod.CASH })

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/mark-as-paid/7', {
      comment: 'ok',
      paymentMethod: PaymentMethod.CASH,
    })
  })

  it('payPartial PUTs /payments/pay-partial/{id} with the amount body', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await payPartial(9, { amount: 50000, comment: 'yarim' })

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/pay-partial/9', {
      amount: 50000,
      comment: 'yarim',
    })
  })

  it('calculatePayment PUTs /payments/calculate/{id} and returns the calculation body', async () => {
    const calc: PaymentCalculationResponse = {
      paymentId: 4,
      studentId: 2,
      studentName: 'Ali Valiyev',
      forMonth: '2026-09',
      plannedStudyUntilDate: '2026-09-20',
      lessonsPlanned: 12,
      lessonsBillable: 8,
      discountPercent: 0,
      amountDue: 400000,
      currentAmountDue: 600000,
      difference: -200000,
    }
    mockedHttp.put.mockResolvedValueOnce({ data: calc })

    const result = await calculatePayment(4, { plannedStudyUntilDate: '2026-09-20' })

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/calculate/4', {
      plannedStudyUntilDate: '2026-09-20',
    })
    expect(result).toEqual(calc)
  })

  it('updatePayment PUTs /payments/{id} with the planned date body', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await updatePayment(11, { plannedStudyUntilDate: '2026-10-01' })

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/11', {
      plannedStudyUntilDate: '2026-10-01',
    })
  })

  describe('parseFilename', () => {
    it('reads a plain filename="…" directive', () => {
      expect(parseFilename('attachment; filename="tolovlar_2026-09-24.xlsx"')).toBe(
        'tolovlar_2026-09-24.xlsx',
      )
    })

    it('reads and URL-decodes an RFC 5987 filename*=UTF-8\'\'… directive', () => {
      const encoded = encodeURIComponent('to’lovlar 2026.xlsx')
      expect(parseFilename(`attachment; filename*=UTF-8''${encoded}`)).toBe(
        'to’lovlar 2026.xlsx',
      )
    })

    it('returns null when the header is undefined', () => {
      expect(parseFilename(undefined)).toBeNull()
    })

    it('returns null for a header with no filename directive', () => {
      expect(parseFilename('attachment')).toBeNull()
    })
  })

  describe('exportPayments', () => {
    it('GETs /payments/export as a blob and returns the header-derived filename', async () => {
      const blob = new Blob(['x'])
      mockedHttp.get.mockResolvedValueOnce({
        data: blob,
        headers: { 'content-disposition': 'attachment; filename="tolovlar_2026-09.xlsx"' },
      })

      const params = { centerId: 3, forMonth: '2026-09' }
      const result = await exportPayments(params)

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/export', {
        params,
        responseType: 'blob',
      })
      expect(result.blob).toBe(blob)
      expect(result.filename).toBe('tolovlar_2026-09.xlsx')
    })

    it('falls back to a tolovlar_<date>.xlsx name when the header is missing', async () => {
      const blob = new Blob(['x'])
      mockedHttp.get.mockResolvedValueOnce({ data: blob, headers: {} })

      const result = await exportPayments({ centerId: 3 })

      const today = new Date().toISOString().slice(0, 10)
      expect(result.filename).toBe(`tolovlar_${today}.xlsx`)
    })
  })

  it('markAsPaid returns the printable check from the response body', async () => {
    const check: PaymentCheck = {
      receiptId: 49,
      checkNo: '1-A',
      transactionNo: 'TRX-20260923-000049',
      invoiceNo: 1,
      installmentIndex: 1,
      status: ReceiptStatus.CONFIRMED,
      student: { fullName: 'X Y', phone: '+998901234567' },
      group: { name: 'G' },
      teacher: { fullName: 'T' },
      forMonth: '2026-09',
      amount: 100000,
      balanceBefore: 138461.54,
      balanceAfter: 38461.54,
      paymentMethod: PaymentMethod.CASH,
      paidAt: null,
      receivedAt: '2026-09-23T10:00:00.000Z',
      createdAt: '2026-09-23T10:00:00.000Z',
      receivedBy: { fullName: 'A V' },
      comment: 'test',
    }
    const body: PaymentActionResponse = { check }
    mockedHttp.put.mockResolvedValueOnce({ data: body })

    const result = await markAsPaid(7, { paymentMethod: PaymentMethod.CASH })

    expect(mockedHttp.put).toHaveBeenCalledWith('/payments/mark-as-paid/7', {
      paymentMethod: PaymentMethod.CASH,
    })
    expect(result).toEqual(body)
  })

  it('payPartial returns the response body', async () => {
    const body: PaymentActionResponse = { check: undefined }
    mockedHttp.put.mockResolvedValueOnce({ data: body })

    const result = await payPartial(9, { amount: 50000, comment: 'yarim' })

    expect(result).toEqual(body)
  })

  describe('previewExclusion / applyExclusion', () => {
    const preview: ExclusionPreviewResponse = {
      paymentId: 855,
      forMonth: '2026-09',
      lessonsPlanned: 13,
      lessonsBillable: 4,
      perLessonAmount: 34615.39,
      baseAmountDue: 138461.54,
      currentAmountDue: 138461.54,
      amountPaid: 100000,
      excludeLessons: 1,
      excludedAmount: 34615.39,
      newAmountDue: 103846.15,
      newRemaining: 3846.15,
    }

    it('previewExclusion PUTs /payments/preview-exclusion/{id} and returns the computed preview', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: preview })

      const result = await previewExclusion(855, { excludeLessons: 1 })

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/preview-exclusion/855', {
        excludeLessons: 1,
      })
      expect(result).toEqual(preview)
    })

    it('applyExclusion PUTs /payments/apply-exclusion/{id} with the reason comment', async () => {
      mockedHttp.put.mockResolvedValueOnce({ data: undefined })

      await applyExclusion(855, { excludeLessons: 1, comment: 'kasal bo\'lgan' })

      expect(mockedHttp.put).toHaveBeenCalledWith('/payments/apply-exclusion/855', {
        excludeLessons: 1,
        comment: 'kasal bo\'lgan',
      })
    })
  })

  describe('fetchPaymentReceipts', () => {
    it('GETs /payments/{id}/receipts and unwraps data.data', async () => {
      const check: PaymentCheck = {
        checkNo: '1',
        status: ReceiptStatus.CONFIRMED,
        student: null,
        group: null,
        teacher: null,
        amount: 100000,
        receivedBy: null,
      }
      mockedHttp.get.mockResolvedValueOnce({ data: { data: [check] } })

      const result = await fetchPaymentReceipts(855)

      expect(mockedHttp.get).toHaveBeenCalledWith('/payments/855/receipts')
      expect(result).toEqual([check])
    })

    it('returns an empty array when the body has no data', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: {} })

      const result = await fetchPaymentReceipts(855)

      expect(result).toEqual([])
    })
  })

  it('fetchReceiptCheck GETs /payments/receipt/{id}/check and returns the body', async () => {
    const check: PaymentCheck = {
      receiptId: 49,
      checkNo: '1-A',
      transactionNo: 'TRX-20260923-000049',
      invoiceNo: 1,
      installmentIndex: 1,
      status: ReceiptStatus.CONFIRMED,
      student: { fullName: 'X Y', phone: '+998901234567' },
      group: { name: 'G' },
      teacher: { fullName: 'T' },
      forMonth: '2026-09',
      amount: 100000,
      balanceBefore: 138461.54,
      balanceAfter: 38461.54,
      paymentMethod: PaymentMethod.CASH,
      paidAt: null,
      receivedAt: '2026-09-23T10:00:00.000Z',
      createdAt: '2026-09-23T10:00:00.000Z',
      receivedBy: { fullName: 'A V' },
      comment: 'test',
    }
    mockedHttp.get.mockResolvedValueOnce({ data: check })

    const result = await fetchReceiptCheck(49)

    expect(mockedHttp.get).toHaveBeenCalledWith('/payments/receipt/49/check')
    expect(result).toEqual(check)
  })
})
