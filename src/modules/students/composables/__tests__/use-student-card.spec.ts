import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useStudentCard } from '../use-student-card'
import { fetchStudentPaymentSummary as fetchStudentPaymentSummaryApi } from '../../api/student-card.api'
import {
  fetchStudentById as fetchStudentByIdApi,
  updateStudent as updateStudentApi,
} from '../../api/students.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { StudentStatus } from '../../enums/student-status.enum'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { t } from '@/locales'
import type { StudentPaymentSummary } from '../../interfaces/student-summary.interface'
import type { StudentDetail } from '../../interfaces/student.interface'
import type { StudentForm } from '../../interfaces/student-form.interface'

import type * as StudentCardApiModule from '../../api/student-card.api'
import type * as StudentsApiModule from '../../api/students.api'

type StudentCardApi = typeof StudentCardApiModule
type StudentsApi = typeof StudentsApiModule

vi.mock('../../api/student-card.api', () => ({
  fetchStudentPaymentSummary: vi.fn<StudentCardApi['fetchStudentPaymentSummary']>(),
  payStudentDebt: vi.fn<StudentCardApi['payStudentDebt']>(),
  fetchStudentTelegramLink: vi.fn<StudentCardApi['fetchStudentTelegramLink']>(),
  regenerateStudentTelegramQr: vi.fn<StudentCardApi['regenerateStudentTelegramQr']>(),
  unlinkTelegramParent: vi.fn<StudentCardApi['unlinkTelegramParent']>(),
}))

vi.mock('../../api/students.api', () => ({
  fetchStudents: vi.fn<StudentsApi['fetchStudents']>(),
  fetchStudentById: vi.fn<StudentsApi['fetchStudentById']>(),
  fetchAllStudents: vi.fn<StudentsApi['fetchAllStudents']>(),
  createStudent: vi.fn<StudentsApi['createStudent']>(),
  updateStudent: vi.fn<StudentsApi['updateStudent']>(),
  changeStudentStatus: vi.fn<StudentsApi['changeStudentStatus']>(),
}))

const mockedFetchSummary = vi.mocked(fetchStudentPaymentSummaryApi)
const mockedFetchById = vi.mocked(fetchStudentByIdApi)
const mockedUpdate = vi.mocked(updateStudentApi)

function makeSummary(overrides: Partial<StudentPaymentSummary> = {}): StudentPaymentSummary {
  return {
    student: {
      id: 1,
      firstName: 'Ali',
      lastName: 'Valiyev',
      phone: '+998901234567',
      status: StudentStatus.ACTIVE,
      monthlyFee: 500000,
      discountPercent: 0,
      centerId: 1,
      groups: [],
    },
    totals: {
      totalDue: 500000,
      totalPaid: 200000,
      totalDebt: 300000,
      totalPending: 0,
      totalReceived: 200000,
      payableNow: 300000,
    },
    months: [
      {
        paymentId: 1,
        forMonth: '2026-09',
        groupId: 3,
        groupName: 'A1',
        amountDue: 500000,
        amountPaid: 200000,
        pendingAmount: 0,
        receivedAmount: 200000,
        remaining: 300000,
        payableNow: 300000,
        status: PaymentStatus.PARTIAL,
      },
    ],
    ...overrides,
  }
}

function makeDetail(overrides: Partial<StudentDetail> = {}): StudentDetail {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '+998901234567',
    status: StudentStatus.ACTIVE,
    groups: [{ id: 3, name: 'A1' }, { id: 4, name: 'B2' }],
    ...overrides,
  }
}

describe('useStudentCard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('load()', () => {
    it('fills summary and derives student/totals/months/payableNow/hasPending/fullName/initials', async () => {
      mockedFetchSummary.mockResolvedValueOnce(makeSummary())
      const c = useStudentCard(() => 1)

      await c.load()

      expect(c.summary.value).not.toBeNull()
      expect(c.student.value?.id).toBe(1)
      expect(c.totals.value?.totalDebt).toBe(300000)
      expect(c.months.value).toHaveLength(1)
      expect(c.payableNow.value).toBe(300000)
      expect(c.hasPending.value).toBe(false)
      expect(c.fullName.value).toBe('Ali Valiyev')
      expect(c.initials.value).toBe('AV')
    })

    it('hasPending is true only when totals.totalPending > 0', async () => {
      mockedFetchSummary.mockResolvedValueOnce(
        makeSummary({ totals: { totalDue: 1, totalPaid: 0, totalDebt: 1, totalPending: 50000, totalReceived: 0, payableNow: 1 } }),
      )
      const c = useStudentCard(() => 1)

      await c.load()

      expect(c.hasPending.value).toBe(true)
    })

    it('initials uppercases the two first letters', async () => {
      mockedFetchSummary.mockResolvedValueOnce(
        makeSummary({
          student: {
            id: 1,
            firstName: 'ali',
            lastName: 'valiyev',
            phone: '+998901234567',
            status: StudentStatus.ACTIVE,
            monthlyFee: 0,
            discountPercent: 0,
            centerId: 1,
            groups: [],
          },
        }),
      )
      const c = useStudentCard(() => 1)

      await c.load()

      expect(c.initials.value).toBe('AV')
    })

    it('a rejected fetch sets failed true, leaves summary null and does not throw', async () => {
      mockedFetchSummary.mockRejectedValueOnce(new Error('network'))
      const c = useStudentCard(() => 1)

      await expect(c.load()).resolves.toBeUndefined()

      expect(c.failed.value).toBe(true)
      expect(c.summary.value).toBeNull()
      expect(c.loading.value).toBe(false)
    })

    it('is a no-op when the id getter returns null', async () => {
      const c = useStudentCard(() => null)

      await c.load()

      expect(mockedFetchSummary).not.toHaveBeenCalled()
    })
  })

  describe('apply()', () => {
    it('swaps in a server-provided summary without refetching', async () => {
      const c = useStudentCard(() => 1)
      const next = makeSummary({ totals: { totalDue: 1, totalPaid: 1, totalDebt: 0, totalPending: 0, totalReceived: 1, payableNow: 0 } })

      c.apply(next)

      expect(c.summary.value).toEqual(next)
      expect(mockedFetchSummary).not.toHaveBeenCalled()
    })

    it('apply(null) falls back to calling load()', async () => {
      mockedFetchSummary.mockResolvedValueOnce(makeSummary())
      const c = useStudentCard(() => 1)

      c.apply(null)
      await Promise.resolve()

      expect(mockedFetchSummary).toHaveBeenCalledTimes(1)
    })
  })

  describe('openEdit()', () => {
    it('fetches the detail, maps groups objects to groupIds and opens the modal', async () => {
      mockedFetchById.mockResolvedValueOnce(makeDetail())
      const c = useStudentCard(() => 1)

      await c.openEdit()

      expect(mockedFetchById).toHaveBeenCalledWith(1)
      expect(c.editing.value?.groupIds).toEqual([3, 4])
      expect(c.editOpen.value).toBe(true)
      expect(c.editLoading.value).toBe(false)
    })

    it('a rejection leaves the modal closed, does not throw, and resets editLoading', async () => {
      mockedFetchById.mockRejectedValueOnce(new Error('boom'))
      const c = useStudentCard(() => 1)

      await expect(c.openEdit()).resolves.toBeUndefined()

      expect(c.editOpen.value).toBe(false)
      expect(c.editing.value).toBeNull()
      expect(c.editLoading.value).toBe(false)
    })
  })

  describe('saveEdit()', () => {
    it('updates, notifies success, closes the modal and reloads', async () => {
      const form: StudentForm = { firstName: 'Ali', lastName: 'Valiyev', phone: '+998901234567' }
      mockedUpdate.mockResolvedValueOnce({
        id: 1,
        firstName: 'Ali',
        lastName: 'Valiyev',
        phone: '+998901234567',
        status: StudentStatus.ACTIVE,
      })
      mockedFetchSummary.mockResolvedValueOnce(makeSummary())
      const c = useStudentCard(() => 1)
      c.editOpen.value = true

      await c.saveEdit(form)

      expect(mockedUpdate).toHaveBeenCalledWith(1, form)
      expect(c.editOpen.value).toBe(false)
      expect(c.editing.value).toBeNull()
      expect(mockedFetchSummary).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({ type: NotificationType.SUCCESS, message: t('common.saved') }),
      )
    })
  })
})
