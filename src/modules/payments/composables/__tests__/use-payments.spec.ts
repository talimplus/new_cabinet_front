import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { usePayments } from '../use-payments'
import {
  fetchPayments as fetchPaymentsApi,
  markAsPaid as markAsPaidApi,
  payPartial as payPartialApi,
  calculatePayment as calculatePaymentApi,
  updatePayment as updatePaymentApi,
  applyExclusion as applyExclusionApi,
} from '../../api/payments.api'
import { fetchAllGroups as fetchAllGroupsApi } from '@/modules/groups/api/groups.api'
import { fetchTeachers as fetchTeachersApi } from '@/modules/users/api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { PaymentCalculationResponse } from '../../interfaces/payment-calculation.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

import type * as PaymentsApiModule from '../../api/payments.api'
import type * as GroupsApiModule from '@/modules/groups/api/groups.api'
import type * as UsersApiModule from '@/modules/users/api/users.api'

type PaymentsApi = typeof PaymentsApiModule
type GroupsApi = typeof GroupsApiModule
type UsersApi = typeof UsersApiModule

vi.mock('../../api/payments.api', () => ({
  fetchPayments: vi.fn<PaymentsApi['fetchPayments']>(),
  markAsPaid: vi.fn<PaymentsApi['markAsPaid']>(),
  payPartial: vi.fn<PaymentsApi['payPartial']>(),
  calculatePayment: vi.fn<PaymentsApi['calculatePayment']>(),
  updatePayment: vi.fn<PaymentsApi['updatePayment']>(),
  applyExclusion: vi.fn<PaymentsApi['applyExclusion']>(),
  exportPayments: vi.fn<PaymentsApi['exportPayments']>(),
  fetchPaymentReceipts: vi.fn<PaymentsApi['fetchPaymentReceipts']>(),
}))
vi.mock('@/modules/groups/api/groups.api', () => ({
  fetchAllGroups: vi.fn<GroupsApi['fetchAllGroups']>(),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchTeachers: vi.fn<UsersApi['fetchTeachers']>(),
}))

const mockedFetch = vi.mocked(fetchPaymentsApi)
const mockedMark = vi.mocked(markAsPaidApi)
const mockedPartial = vi.mocked(payPartialApi)
const mockedCalc = vi.mocked(calculatePaymentApi)
const mockedUpdate = vi.mocked(updatePaymentApi)
const mockedExclusion = vi.mocked(applyExclusionApi)
const mockedGroups = vi.mocked(fetchAllGroupsApi)
const mockedTeachers = vi.mocked(fetchTeachersApi)

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    student: { firstName: 'Ali', lastName: 'Valiyev' },
    group: { name: 'A1' },
    amountDue: '600000.00',
    amountPaid: '0.00',
    remainingAmount: 600000,
    payableNow: 600000,
    status: PaymentStatus.UNPAID,
    forMonth: '2026-09',
    dueDate: '2026-09-10',
    hardDueDate: '2026-09-20',
    isOverdue: false,
    lessonsPlanned: 12,
    lessonsBillable: 12,
    createdAt: '2026-09-01',
    ...overrides,
  }
}

const check: PaymentCheck = {
  receiptId: 5,
  checkNo: '1-A',
  status: ReceiptStatus.CONFIRMED,
  student: { fullName: 'Ali Valiyev' },
  group: { name: 'A1' },
  teacher: { fullName: 'Ustoz' },
  amount: 200000,
  receivedBy: { fullName: 'Kassir' },
}

const reception = { paymentMethod: PaymentMethod.CASH, comment: 'ok' }

describe('usePayments', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      data: [makePayment()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 4 },
    })
    mockedGroups.mockResolvedValue([])
    mockedTeachers.mockResolvedValue([])
    mockedMark.mockResolvedValue({ check })
    mockedPartial.mockResolvedValue({ check })
    mockedUpdate.mockResolvedValue(undefined)
    mockedExclusion.mockResolvedValue(undefined)
  })

  describe('load()', () => {
    it('composes forMonth from year+month and strips the all status sentinel', async () => {
      const p = usePayments()
      p.filters.year = 2026
      p.filters.month = '09'
      p.applyFilters()
      await flushPromises()

      expect(mockedFetch).toHaveBeenCalledWith({
        forMonth: '2026-09',
        page: 1,
        perPage: 10,
        status: undefined,
        groupId: undefined,
        teacherId: undefined,
        search: undefined,
      })
      expect(p.rows.value).toHaveLength(1)
      expect(p.totalPages.value).toBe(4)
    })

    it('sends the concrete status, teacher, group and search when set', async () => {
      const p = usePayments()
      p.filters.year = 2026
      p.filters.month = '03'
      p.filters.status = PaymentStatus.PARTIAL
      p.filters.search = 'ali'
      p.filters.groupId = 8
      p.filters.teacherId = 4
      await p.setPage(2)
      await flushPromises()

      expect(mockedFetch).toHaveBeenLastCalledWith(
        expect.objectContaining({
          forMonth: '2026-03',
          page: 2,
          status: PaymentStatus.PARTIAL,
          search: 'ali',
          groupId: 8,
          teacherId: 4,
        }),
      )
    })
  })

  describe('teacher filter', () => {
    it('narrows the group list to the picked teacher and clears the group', async () => {
      const p = usePayments()
      p.filters.groupId = 8
      await p.setTeacher(4)
      await flushPromises()

      expect(mockedGroups).toHaveBeenLastCalledWith(undefined, 4)
      expect(p.filters.groupId).toBeNull()
    })

    it('drops a group that the new teacher does not own', async () => {
      mockedGroups.mockResolvedValue([])
      const p = usePayments()
      p.filters.groupId = 99
      await p.setTeacher(null)
      await flushPromises()

      expect(p.filters.groupId).toBeNull()
    })
  })

  describe('setYear()', () => {
    it('pulls a future month back to the current one in the current year', async () => {
      const p = usePayments()
      const thisYear = new Date().getFullYear()
      p.filters.month = '12'
      p.setYear(thisYear)
      await flushPromises()

      const latest = String(new Date().getMonth() + 1).padStart(2, '0')
      expect(p.filters.month <= latest).toBe(true)
    })

    it('leaves the month alone for a past year', async () => {
      const p = usePayments()
      p.filters.month = '12'
      p.setYear(new Date().getFullYear() - 1)
      await flushPromises()

      expect(p.filters.month).toBe('12')
    })
  })

  describe('mark as paid', () => {
    it('sends the reception fields, notifies, closes and shows the check', async () => {
      const p = usePayments()
      p.openMarkAsPaid(makePayment({ id: 42 }))
      expect(p.markDialog.open).toBe(true)

      await p.confirmMarkAsPaid({ exclusion: null, reception })
      await flushPromises()

      expect(mockedExclusion).not.toHaveBeenCalled()
      expect(mockedMark).toHaveBeenCalledWith(42, reception)
      expect(p.markDialog.open).toBe(false)
      expect(p.checks.checksOpen.value).toBe(true)
      expect(p.checks.checks.value).toEqual([check])
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('stores the write-off BEFORE taking the money so the total is already reduced', async () => {
      const order: string[] = []
      mockedExclusion.mockImplementationOnce(async () => void order.push('exclusion'))
      mockedMark.mockImplementationOnce(async () => {
        order.push('mark')
        return { check }
      })

      const p = usePayments()
      p.openMarkAsPaid(makePayment({ id: 42 }))
      await p.confirmMarkAsPaid({
        exclusion: { excludeLessons: 2, comment: 'kasal' },
        reception,
      })
      await flushPromises()

      expect(mockedExclusion).toHaveBeenCalledWith(42, { excludeLessons: 2, comment: 'kasal' })
      expect(order).toEqual(['exclusion', 'mark'])
    })
  })

  describe('partial payment', () => {
    const calc: PaymentCalculationResponse = {
      paymentId: 3,
      studentId: 1,
      studentName: 'Ali Valiyev',
      forMonth: '2026-09',
      plannedStudyUntilDate: '2026-09-15',
      lessonsPlanned: 12,
      lessonsBillable: 6,
      discountPercent: 0,
      amountDue: 300000,
      currentAmountDue: 600000,
      difference: -300000,
    }

    it('runCalculate stores the date and the recomputed total', async () => {
      mockedCalc.mockResolvedValueOnce(calc)

      const p = usePayments()
      p.openPartial(makePayment({ id: 3 }))
      await p.runCalculate(new Date(2026, 8, 15))
      await flushPromises()

      expect(mockedCalc).toHaveBeenCalledWith(3, { plannedStudyUntilDate: '2026-09-15' })
      expect(p.partial.calculation).toEqual(calc)
      expect(p.partial.plannedStudyUntilDate).toEqual(new Date(2026, 8, 15))
    })

    it('clearCalculation drops both the date and the result', async () => {
      mockedCalc.mockResolvedValueOnce(calc)
      const p = usePayments()
      p.openPartial(makePayment({ id: 3 }))
      await p.runCalculate(new Date(2026, 8, 15))

      p.clearCalculation()

      expect(p.partial.calculation).toBeNull()
      expect(p.partial.plannedStudyUntilDate).toBeNull()
    })

    it('confirmPartial saves the date, pays, notifies and shows the check', async () => {
      const p = usePayments()
      p.openPartial(makePayment({ id: 9 }))
      p.partial.plannedStudyUntilDate = new Date(2026, 8, 15)

      await p.confirmPartial({ amount: 200000, exclusion: null, reception })
      await flushPromises()

      expect(mockedUpdate).toHaveBeenCalledWith(9, { plannedStudyUntilDate: '2026-09-15' })
      expect(mockedPartial).toHaveBeenCalledWith(9, { amount: 200000, ...reception })
      expect(p.partial.open).toBe(false)
      expect(p.checks.checks.value).toEqual([check])
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('confirmPartial skips updatePayment when no date is chosen', async () => {
      const p = usePayments()
      p.openPartial(makePayment({ id: 9 }))

      await p.confirmPartial({ amount: 100000, exclusion: null, reception: {} })
      await flushPromises()

      expect(mockedUpdate).not.toHaveBeenCalled()
      expect(mockedPartial).toHaveBeenCalledWith(9, { amount: 100000 })
    })

    it('confirmPartial refuses a non-positive amount', async () => {
      const p = usePayments()
      p.openPartial(makePayment({ id: 9 }))

      await p.confirmPartial({ amount: 0, exclusion: null, reception })
      await flushPromises()

      expect(mockedPartial).not.toHaveBeenCalled()
    })
  })
})
