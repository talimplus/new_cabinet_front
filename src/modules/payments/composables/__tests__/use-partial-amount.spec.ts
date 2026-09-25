import { describe, it, expect } from 'vitest'
import { ref, nextTick } from 'vue'
import { usePartialAmount } from '../use-partial-amount'
import { emptyExclusionState } from '../../interfaces/payment-exclusion.interface'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import { PaymentStatus } from '../../enums/payment-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { PaymentCalculationResponse } from '../../interfaces/payment-calculation.interface'
import type { ExclusionState, ExclusionPreviewResponse } from '../../interfaces/payment-exclusion.interface'

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
    payableNow: 300000,
    ...overrides,
  }
}

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

function setup() {
  const payment = ref<Payment | null>(makePayment())
  const calculation = ref<PaymentCalculationResponse | null>(null)
  const isOpen = ref(false)
  const api = usePartialAmount(() => payment.value, () => calculation.value, () => isOpen.value)
  return { payment, calculation, isOpen, api }
}

describe('usePartialAmount', () => {
  it('payable follows the exclusion preview', async () => {
    const { api } = setup()
    expect(api.payable.value).toBe(300000)

    api.exclusion.value = {
      ...emptyExclusionState(),
      active: true,
      preview: makePreview({ newRemaining: 200000 }),
    }
    await nextTick()

    expect(api.payable.value).toBe(200000)
  })

  describe('error', () => {
    it('is undefined for a null amount', () => {
      const { api } = setup()
      expect(api.amount.value).toBeNull()
      expect(api.error.value).toBeUndefined()
    })

    it('reports the "greater than zero" message for a non-positive amount', () => {
      const { api } = setup()
      api.amount.value = 0
      expect(api.error.value).toBe(t('payments.validation.amountGreaterThanZero'))

      api.amount.value = -5
      expect(api.error.value).toBe(t('payments.validation.amountGreaterThanZero'))
    })

    it('reports the "not exceed" message above payable', () => {
      const { api } = setup()
      api.amount.value = 400000
      expect(api.error.value).toBe(
        t('payments.validation.amountNotExceed', { amount: formatSom(api.payable.value) }),
      )
    })

    it('is undefined for a valid amount', () => {
      const { api } = setup()
      api.amount.value = 100000
      expect(api.error.value).toBeUndefined()
    })
  })

  describe('valid', () => {
    it('is false with no amount entered', () => {
      const { api } = setup()
      expect(api.valid.value).toBe(false)
    })

    it('is false when there is an error', () => {
      const { api } = setup()
      api.amount.value = -1
      expect(api.valid.value).toBe(false)
    })

    it('is false while the exclusion is previewing', () => {
      const { api } = setup()
      api.amount.value = 100000
      api.exclusion.value = { ...emptyExclusionState(), previewing: true }
      expect(api.valid.value).toBe(false)
    })

    it('is false when the exclusion itself is invalid (blank reason)', () => {
      const { api } = setup()
      api.amount.value = 100000
      api.exclusion.value = { ...emptyExclusionState(), valid: false }
      expect(api.valid.value).toBe(false)
    })

    it('is true with a valid amount and a valid, non-previewing exclusion', () => {
      const { api } = setup()
      api.amount.value = 100000
      expect(api.valid.value).toBe(true)
    })
  })

  describe('setExclusion', () => {
    it('refills amount with preview.newRemaining when it changes', () => {
      const { api } = setup()
      api.setExclusion({
        ...emptyExclusionState(),
        active: true,
        preview: makePreview({ newRemaining: 180000 }),
      })
      expect(api.amount.value).toBe(180000)
    })

    it('does not overwrite a hand-typed amount when the same preview is re-emitted', () => {
      const { api } = setup()
      const state: ExclusionState = {
        ...emptyExclusionState(),
        active: true,
        preview: makePreview({ newRemaining: 180000 }),
      }
      api.setExclusion(state)
      expect(api.amount.value).toBe(180000)

      // Reception hand-types a different figure.
      api.amount.value = 175000

      // Typing the write-off reason re-emits state with the SAME preview number.
      api.setExclusion({ ...state, valid: true })

      expect(api.amount.value).toBe(175000)
    })
  })

  it('opening the dialog resets amount and exclusion', async () => {
    const { api, isOpen } = setup()
    api.amount.value = 50000
    api.exclusion.value = { ...emptyExclusionState(), active: true }

    isOpen.value = true
    await nextTick()

    expect(api.amount.value).toBeNull()
    expect(api.exclusion.value).toEqual(emptyExclusionState())
  })

  it('a new calculation sets amount to calculation.amountDue', async () => {
    const { api, calculation } = setup()
    calculation.value = {
      paymentId: 1,
      studentId: 1,
      studentName: 'Ali Valiyev',
      forMonth: '2026-09',
      plannedStudyUntilDate: '2026-09-20',
      lessonsPlanned: 12,
      lessonsBillable: 8,
      discountPercent: 0,
      amountDue: 200000,
      currentAmountDue: 300000,
      difference: -100000,
    }
    await nextTick()

    expect(api.amount.value).toBe(200000)
  })
})
