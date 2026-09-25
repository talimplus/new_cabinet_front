import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { usePaymentExclusion } from '../use-payment-exclusion'
import { previewExclusion as previewExclusionApi } from '../../api/payments.api'
import { PaymentStatus } from '../../enums/payment-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { ExclusionPreviewResponse } from '../../interfaces/payment-exclusion.interface'

import type * as PaymentsApiModule from '../../api/payments.api'

type PaymentsApi = typeof PaymentsApiModule

vi.mock('../../api/payments.api', () => ({
  previewExclusion: vi.fn<PaymentsApi['previewExclusion']>(),
}))

const mockedPreviewExclusion = vi.mocked(previewExclusionApi)

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 7,
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

function makePreview(overrides: Partial<ExclusionPreviewResponse> = {}): ExclusionPreviewResponse {
  return {
    paymentId: 7,
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

describe('usePaymentExclusion', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    mockedPreviewExclusion.mockResolvedValue(makePreview())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('typing lessons flips active and eventually previews with excludeLessons', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 3

    await vi.advanceTimersByTimeAsync(0)
    expect(exclusion.active.value).toBe(true)

    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    expect(mockedPreviewExclusion).toHaveBeenCalledWith(payment.id, { excludeLessons: 3 })
  })

  it('amount mode previews with excludeAmount', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('amount')
    exclusion.amount.value = 15000

    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    expect(mockedPreviewExclusion).toHaveBeenCalledWith(payment.id, { excludeAmount: 15000 })
  })

  it('previewing flips true immediately then false once the preview resolves', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 2
    await vi.advanceTimersByTimeAsync(0)

    expect(exclusion.previewing.value).toBe(true)

    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    expect(exclusion.previewing.value).toBe(false)
  })

  it('valid is false with an active write-off and a blank comment', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 2
    await vi.advanceTimersByTimeAsync(0)

    expect(exclusion.valid.value).toBe(false)
  })

  it('valid is true once a reason is typed', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 2
    exclusion.comment.value = 'noto‘g‘ri hisoblangan'
    await vi.advanceTimersByTimeAsync(0)

    expect(exclusion.valid.value).toBe(true)
  })

  it('valid is true when nothing is entered', () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    expect(exclusion.valid.value).toBe(true)
  })

  it('state.form is null while inactive', () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    expect(exclusion.state.value.form).toBeNull()
  })

  it('state.form holds excludeLessons and the trimmed comment once active', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 4
    exclusion.comment.value = '  sabab  '
    await vi.advanceTimersByTimeAsync(0)

    expect(exclusion.state.value.form).toEqual({ excludeLessons: 4, comment: 'sabab' })
  })

  it('setMode clears the other field and the preview', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 4
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()
    expect(exclusion.preview.value).not.toBeNull()

    exclusion.setMode('amount')

    expect(exclusion.lessons.value).toBeNull()
    expect(exclusion.amount.value).toBeNull()
    expect(exclusion.preview.value).toBeNull()
  })

  it('a failing preview clears preview and does not throw', async () => {
    mockedPreviewExclusion.mockRejectedValueOnce(new Error('network'))
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 2

    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    expect(exclusion.preview.value).toBeNull()
    expect(exclusion.previewing.value).toBe(false)
  })

  it('reset returns everything to the initial state', async () => {
    const payment = makePayment()
    const exclusion = usePaymentExclusion(() => payment)
    exclusion.setMode('lessons')
    exclusion.lessons.value = 4
    exclusion.comment.value = 'sabab'
    await vi.advanceTimersByTimeAsync(400)
    await flushPromises()

    exclusion.reset()

    expect(exclusion.mode.value).toBeNull()
    expect(exclusion.lessons.value).toBeNull()
    expect(exclusion.amount.value).toBeNull()
    expect(exclusion.comment.value).toBe('')
    expect(exclusion.preview.value).toBeNull()
    expect(exclusion.previewing.value).toBe(false)
  })
})
