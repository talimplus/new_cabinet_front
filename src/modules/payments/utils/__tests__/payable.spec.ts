import { describe, it, expect } from 'vitest'
import { toAmount, payableNow, payableAfterExclusion, hasReceipts } from '../payable'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { emptyExclusionState } from '../../interfaces/payment-exclusion.interface'
import type { Payment } from '../../interfaces/payment.interface'
import type { ExclusionState } from '../../interfaces/payment-exclusion.interface'
import type { ExclusionPreviewResponse } from '../../interfaces/payment-exclusion.interface'

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
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

describe('toAmount', () => {
  it('passes a number through unchanged', () => {
    expect(toAmount(138461.54)).toBe(138461.54)
    expect(toAmount(0)).toBe(0)
  })

  it('parses a DECIMAL string', () => {
    expect(toAmount('138461.54')).toBe(138461.54)
  })

  it('returns 0 for null/undefined/empty string', () => {
    expect(toAmount(null)).toBe(0)
    expect(toAmount(undefined)).toBe(0)
    expect(toAmount('')).toBe(0)
  })

  it('returns 0 for a garbage string', () => {
    expect(toAmount('not-a-number')).toBe(0)
  })
})

describe('payableNow', () => {
  it('returns 0 for a null payment', () => {
    expect(payableNow(null)).toBe(0)
    expect(payableNow(undefined)).toBe(0)
  })

  it('returns the backend payableNow when present', () => {
    const payment = makePayment({ payableNow: 12345, remainingAmount: 999999 })
    expect(payableNow(payment)).toBe(12345)
  })

  it('falls back to remainingAmount minus pendingAmount when payableNow is absent', () => {
    const payment = makePayment({ remainingAmount: 100000, pendingAmount: 30000 })
    expect(payableNow(payment)).toBe(70000)
  })

  it('falls back to remainingAmount when pendingAmount is absent', () => {
    const payment = makePayment({ remainingAmount: 100000 })
    expect(payableNow(payment)).toBe(100000)
  })

  it('never goes negative', () => {
    const payment = makePayment({ remainingAmount: 100000, pendingAmount: 150000 })
    expect(payableNow(payment)).toBe(0)
  })
})

function makePreview(overrides: Partial<ExclusionPreviewResponse> = {}): ExclusionPreviewResponse {
  return {
    paymentId: 1,
    forMonth: '2026-09',
    lessonsPlanned: 12,
    lessonsBillable: 10,
    perLessonAmount: 25000,
    baseAmountDue: 300000,
    currentAmountDue: 300000,
    amountPaid: 0,
    excludedAmount: 50000,
    newAmountDue: 250000,
    newRemaining: 250000,
    ...overrides,
  }
}

describe('payableAfterExclusion', () => {
  it('returns preview.newRemaining minus pendingAmount when an exclusion is active', () => {
    const payment = makePayment({ pendingAmount: 20000 })
    const exclusion: ExclusionState = {
      ...emptyExclusionState(),
      active: true,
      preview: makePreview({ newRemaining: 250000 }),
    }
    expect(payableAfterExclusion(payment, exclusion)).toBe(230000)
  })

  it('floors the exclusion result at 0', () => {
    const payment = makePayment({ pendingAmount: 300000 })
    const exclusion: ExclusionState = {
      ...emptyExclusionState(),
      active: true,
      preview: makePreview({ newRemaining: 250000 }),
    }
    expect(payableAfterExclusion(payment, exclusion)).toBe(0)
  })

  it('falls back to payableNow without an active exclusion', () => {
    const payment = makePayment({ payableNow: 111 })
    expect(payableAfterExclusion(payment, emptyExclusionState())).toBe(111)
  })

  it('falls back to payableNow when active but no preview yet', () => {
    const payment = makePayment({ payableNow: 222 })
    const exclusion: ExclusionState = { ...emptyExclusionState(), active: true, preview: null }
    expect(payableAfterExclusion(payment, exclusion)).toBe(222)
  })
})

describe('hasReceipts', () => {
  it('is true when amountPaid (a string) is greater than 0', () => {
    expect(hasReceipts(makePayment({ amountPaid: '15000.00' }))).toBe(true)
  })

  it('is true when hasPendingReceipt is set, even with no amountPaid', () => {
    expect(hasReceipts(makePayment({ amountPaid: '0.00', hasPendingReceipt: true }))).toBe(true)
  })

  it('is false when there is neither paid money nor a pending receipt', () => {
    expect(hasReceipts(makePayment({ amountPaid: '0.00', hasPendingReceipt: false }))).toBe(false)
  })
})
