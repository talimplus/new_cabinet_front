import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { ref } from 'vue'
import { usePayDebt } from '../use-pay-debt'
import { payStudentDebt as payStudentDebtApi } from '../../api/student-card.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { StudentStatus } from '../../enums/student-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StudentSummaryMonth, StudentPaymentSummary } from '../../interfaces/student-summary.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

import type * as StudentCardApiModule from '../../api/student-card.api'

type StudentCardApi = typeof StudentCardApiModule

vi.mock('../../api/student-card.api', () => ({
  fetchStudentPaymentSummary: vi.fn<StudentCardApi['fetchStudentPaymentSummary']>(),
  payStudentDebt: vi.fn<StudentCardApi['payStudentDebt']>(),
  fetchStudentTelegramLink: vi.fn<StudentCardApi['fetchStudentTelegramLink']>(),
  regenerateStudentTelegramQr: vi.fn<StudentCardApi['regenerateStudentTelegramQr']>(),
  unlinkTelegramParent: vi.fn<StudentCardApi['unlinkTelegramParent']>(),
}))

const mockedPay = vi.mocked(payStudentDebtApi)

function makeMonth(overrides: Partial<StudentSummaryMonth> = {}): StudentSummaryMonth {
  return {
    paymentId: 1,
    forMonth: '2026-09',
    groupId: 3,
    groupName: 'A1',
    amountDue: 100,
    amountPaid: 0,
    pendingAmount: 0,
    receivedAmount: 0,
    remaining: 100,
    payableNow: 100,
    status: PaymentStatus.UNPAID,
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
    amount: 300,
    receivedBy: null,
    ...overrides,
  }
}

function makeSummary(overrides: Partial<StudentPaymentSummary> = {}): StudentPaymentSummary {
  return {
    student: {
      id: 1,
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '+998901234567',
      status: StudentStatus.ACTIVE,
      monthlyFee: 0,
      discountPercent: 0,
      centerId: 1,
      groups: [],
    },
    totals: { totalDue: 0, totalPaid: 0, totalDebt: 0, totalPending: 0, totalReceived: 0, payableNow: 0 },
    months: [],
    ...overrides,
  }
}

describe('usePayDebt', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('error / valid', () => {
    it('null/0/negative amount -> min message', () => {
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.amount.value = null
      expect(p.error.value).toBe(t('students.view.validation.min'))
      p.amount.value = 0
      expect(p.error.value).toBe(t('students.view.validation.min'))
      p.amount.value = -5
      expect(p.error.value).toBe(t('students.view.validation.min'))
    })

    it('an amount above payableNow -> max message with the formatted amount', () => {
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.amount.value = 301

      expect(p.error.value).toBe(t('students.view.validation.max', { amount: formatSom(300) }))
    })

    it('a valid amount -> empty error, valid true', () => {
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.amount.value = 200

      expect(p.error.value).toBe('')
      expect(p.valid.value).toBe(true)
    })

    it('valid is false when payableNow is 0 even with a positive amount', () => {
      const p = usePayDebt(() => 1, () => [], () => 0)
      p.amount.value = 1

      // 1 > payableNow() (0), so error() reports the max message — and valid follows it.
      expect(p.error.value).toBe(t('students.view.validation.max', { amount: formatSom(0) }))
      expect(p.valid.value).toBe(false)
    })
  })

  describe('openModal()', () => {
    it('pre-fills amount with payableNow and resets reception fields', () => {
      const p = usePayDebt(() => 1, () => [], () => 450)
      p.reception.comment.value = 'leftover'
      p.reception.method.value = PaymentMethod.CARD

      p.openModal()

      expect(p.amount.value).toBe(450)
      expect(p.reception.comment.value).toBe('')
      expect(p.reception.method.value).toBe(PaymentMethod.CASH)
      expect(p.open.value).toBe(true)
    })
  })

  describe('allocation', () => {
    it('walks months reversed (oldest first) and stops once the amount is spent', () => {
      // newest -> oldest as arriving from the backend
      const months = ref<StudentSummaryMonth[]>([
        makeMonth({ forMonth: '2026-09', groupName: 'Newest', payableNow: 100 }),
        makeMonth({ forMonth: '2026-08', groupName: 'Middle', payableNow: 200 }),
        makeMonth({ forMonth: '2026-07', groupName: 'Oldest', payableNow: 300 }),
      ])
      const p = usePayDebt(() => 1, () => months.value, () => 600)
      p.amount.value = 350

      expect(p.allocation.value).toEqual([
        { forMonth: '2026-07', groupName: 'Oldest', allocated: 300 },
        { forMonth: '2026-08', groupName: 'Middle', allocated: 50 },
      ])
    })

    it('skips months with payableNow <= 0', () => {
      const months = [
        makeMonth({ forMonth: '2026-09', groupName: 'Newest', payableNow: 0 }),
        makeMonth({ forMonth: '2026-08', groupName: 'Oldest', payableNow: 100 }),
      ]
      const p = usePayDebt(() => 1, () => months, () => 100)
      p.amount.value = 100

      expect(p.allocation.value).toEqual([{ forMonth: '2026-08', groupName: 'Oldest', allocated: 100 }])
    })

    it('amount 0 -> empty array', () => {
      const months = [makeMonth()]
      const p = usePayDebt(() => 1, () => months, () => 100)
      p.amount.value = 0

      expect(p.allocation.value).toEqual([])
    })

    it('an amount larger than the total debt allocates every month and stops', () => {
      const months = [
        makeMonth({ forMonth: '2026-08', groupName: 'Middle', payableNow: 200 }),
        makeMonth({ forMonth: '2026-07', groupName: 'Oldest', payableNow: 300 }),
      ]
      const p = usePayDebt(() => 1, () => months, () => 500)
      p.amount.value = 10000

      expect(p.allocation.value).toEqual([
        { forMonth: '2026-07', groupName: 'Oldest', allocated: 300 },
        { forMonth: '2026-08', groupName: 'Middle', allocated: 200 },
      ])
    })
  })

  describe('submit()', () => {
    it('sends amount + reception fields, notifies success, closes and exposes checks', async () => {
      const summary = makeSummary({ checks: [makeCheck()] })
      mockedPay.mockResolvedValueOnce(summary)
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.openModal()
      p.amount.value = 300
      p.reception.comment.value = 'thanks'

      const result = await p.submit()

      expect(mockedPay).toHaveBeenCalledWith(1, {
        amount: 300,
        paymentMethod: PaymentMethod.CASH,
        paidAt: undefined,
        comment: 'thanks',
      })
      expect(p.open.value).toBe(false)
      expect(p.checks.value).toEqual(summary.checks)
      expect(p.checksOpen.value).toBe(true)
      expect(result).toEqual(summary)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('students.view.messages.paySuccess'),
        }),
      )
    })

    it('on rejection returns null, leaves open true and clears loading', async () => {
      mockedPay.mockRejectedValueOnce(new Error('boom'))
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.openModal()
      p.amount.value = 300

      const result = await p.submit()

      expect(result).toBeNull()
      expect(p.open.value).toBe(true)
      expect(p.loading.value).toBe(false)
    })
  })

  describe('closeChecks()', () => {
    it('empties both checks and checksOpen', async () => {
      mockedPay.mockResolvedValueOnce(makeSummary({ checks: [makeCheck()] }))
      const p = usePayDebt(() => 1, () => [], () => 300)
      p.openModal()
      p.amount.value = 300
      await p.submit()

      p.closeChecks()

      expect(p.checks.value).toEqual([])
      expect(p.checksOpen.value).toBe(false)
    })
  })
})
