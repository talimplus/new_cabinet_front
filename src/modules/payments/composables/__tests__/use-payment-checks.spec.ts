import { describe, it, expect, vi, beforeEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { usePaymentChecks } from '../use-payment-checks'
import { fetchPaymentReceipts as fetchPaymentReceiptsApi } from '../../api/payments.api'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

import type * as PaymentsApiModule from '../../api/payments.api'

type PaymentsApi = typeof PaymentsApiModule

vi.mock('../../api/payments.api', () => ({
  fetchPaymentReceipts: vi.fn<PaymentsApi['fetchPaymentReceipts']>(),
}))

const mockedFetchPaymentReceipts = vi.mocked(fetchPaymentReceiptsApi)

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 3,
    student: { firstName: 'Ali', lastName: 'Valiyev' },
    group: { name: 'A1' },
    amountDue: '300000.00',
    amountPaid: '0.00',
    remainingAmount: 300000,
    status: PaymentStatus.UNPAID,
    forMonth: '2026-09',
    dueDate: '2026-09-05',
    hardDueDate: '2026-09-10',
    isOverdue: false,
    lessonsPlanned: 12,
    lessonsBillable: 12,
    createdAt: '2026-09-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeCheck(overrides: Partial<PaymentCheck> = {}): PaymentCheck {
  return {
    checkNo: '1',
    status: ReceiptStatus.CONFIRMED,
    student: null,
    group: null,
    teacher: null,
    amount: 100000,
    receivedBy: null,
    ...overrides,
  }
}

describe('usePaymentChecks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('showChecks', () => {
    it('filters out undefined/null entries and opens with the valid ones', () => {
      const checks = usePaymentChecks()
      const valid = makeCheck()
      checks.showChecks([undefined, valid, null])

      expect(checks.checksOpen.value).toBe(true)
      expect(checks.checks.value).toEqual([valid])
    })

    it('does nothing when nothing valid is passed', () => {
      const checks = usePaymentChecks()
      checks.showChecks([undefined, null])

      expect(checks.checksOpen.value).toBe(false)
      expect(checks.checks.value).toEqual([])
    })
  })

  it('openHistory sets the payment, opens, and loads the receipts', async () => {
    const payment = makePayment()
    const receipts = [makeCheck({ checkNo: '1' }), makeCheck({ checkNo: '1-A' })]
    mockedFetchPaymentReceipts.mockResolvedValueOnce(receipts)

    const checks = usePaymentChecks()
    checks.openHistory(payment)

    expect(checks.history.payment).toEqual(payment)
    expect(checks.history.open).toBe(true)

    await flushPromises()

    expect(mockedFetchPaymentReceipts).toHaveBeenCalledWith(payment.id)
    expect(checks.receipts.value).toEqual(receipts)
    expect(checks.history.loading).toBe(false)
    expect(checks.history.failed).toBe(false)
  })

  it('a rejected fetch sets history.failed and leaves receipts empty; loadHistory retries', async () => {
    const payment = makePayment()
    mockedFetchPaymentReceipts.mockRejectedValueOnce(new Error('network'))

    const checks = usePaymentChecks()
    checks.openHistory(payment)
    await flushPromises()

    expect(checks.history.failed).toBe(true)
    expect(checks.receipts.value).toEqual([])

    const receipts = [makeCheck()]
    mockedFetchPaymentReceipts.mockResolvedValueOnce(receipts)
    await checks.loadHistory()

    expect(checks.history.failed).toBe(false)
    expect(checks.receipts.value).toEqual(receipts)
  })

  it('closeHistory clears the history state', async () => {
    const payment = makePayment()
    mockedFetchPaymentReceipts.mockResolvedValueOnce([makeCheck()])
    const checks = usePaymentChecks()
    checks.openHistory(payment)
    await flushPromises()

    checks.closeHistory()

    expect(checks.history.open).toBe(false)
    expect(checks.history.payment).toBeNull()
    expect(checks.receipts.value).toEqual([])
  })

  it('closeChecks clears the checks state', () => {
    const checks = usePaymentChecks()
    checks.showChecks([makeCheck()])

    checks.closeChecks()

    expect(checks.checksOpen.value).toBe(false)
    expect(checks.checks.value).toEqual([])
  })
})
