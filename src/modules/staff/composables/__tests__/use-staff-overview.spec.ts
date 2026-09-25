import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useStaffOverview } from '../use-staff-overview'
import {
  fetchStaffOverview as fetchStaffOverviewApi,
  fetchMyOverview as fetchMyOverviewApi,
  createStaffDeduction as createStaffDeductionApi,
  deleteStaffDeduction as deleteStaffDeductionApi,
} from '../../api/staff.api'
import { payStaffSalary as payStaffSalaryApi } from '@/modules/payroll/api/payroll.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { StaffTab } from '../../enums/staff-tab.enum'
import { StaffDeductionType } from '../../enums/staff-deduction-type.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { PayrollStatus } from '@/modules/payroll/enums/payroll-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StaffOverview, StaffDeductionRow } from '../../interfaces/staff-overview.interface'

import type * as StaffApiModule from '../../api/staff.api'
import type * as PayrollApiModule from '@/modules/payroll/api/payroll.api'

type StaffApi = typeof StaffApiModule
type PayrollApi = typeof PayrollApiModule

vi.mock('../../api/staff.api', () => ({
  fetchStaffOverview: vi.fn<StaffApi['fetchStaffOverview']>(),
  fetchMyOverview: vi.fn<StaffApi['fetchMyOverview']>(),
  fetchStaffDeductions: vi.fn<StaffApi['fetchStaffDeductions']>(),
  createStaffDeduction: vi.fn<StaffApi['createStaffDeduction']>(),
  deleteStaffDeduction: vi.fn<StaffApi['deleteStaffDeduction']>(),
}))
vi.mock('@/modules/payroll/api/payroll.api', () => ({
  payStaffSalary: vi.fn<PayrollApi['payStaffSalary']>(),
}))

const mockedFetchStaffOverview = vi.mocked(fetchStaffOverviewApi)
const mockedFetchMyOverview = vi.mocked(fetchMyOverviewApi)
const mockedCreateDeduction = vi.mocked(createStaffDeductionApi)
const mockedDeleteDeduction = vi.mocked(deleteStaffDeductionApi)
const mockedPaySalary = vi.mocked(payStaffSalaryApi)

function makeOverview(overrides: Partial<StaffOverview> = {}): StaffOverview {
  return {
    user: {
      id: 50,
      firstName: 'Perm',
      lastName: 'reception',
      phone: '+998907092816',
      login: 'perm.reception@test.uz',
      role: 'reception',
      roleName: 'Qabulxona',
      centerId: 4,
      centerName: 'Markaz 1',
      salary: 3000000,
      commissionPercentage: 0,
      createdAt: '2026-08-01T04:00:00.000Z',
    },
    forMonth: '2026-09-01',
    summary: {
      expectedDays: 0,
      attendedDays: 0,
      missedDays: 0,
      lateDays: 0,
      totalLateMinutes: 0,
      flaggedDays: 0,
      unsettledCount: 2,
      unsettledAmount: 1200,
      rejectedCount: 1,
      rejectedAmount: 1500,
      deductionThisMonth: 0,
      deductionOutstanding: 0,
    },
    months: [],
    lateRecords: [{ id: 1, workDate: '2026-09-10', checkInAt: null, firstLessonAt: null, lateMinutes: 5, confidence: 'high' }],
    attendanceRecords: [],
    unsettledReceipts: [
      {
        id: 55,
        amount: 700,
        status: ReceiptStatus.PENDING,
        paymentMethod: PaymentMethod.CASH,
        checkNo: '1-A-B-C-D-E-F',
        transactionNo: 'TRX-20260924-000055',
        receivedAt: '2026-09-24T07:03:44.646Z',
        comment: null,
        student: { id: 29, firstName: 'TestEdited', lastName: 'Claude' },
        group: { id: 14, name: 'Guruh 266227' },
        forMonth: '2026-09-01',
      },
    ],
    deductions: [],
    salary: {
      id: 70,
      forMonth: '2026-09-01',
      baseSalary: 3000000,
      deductionAmount: 0,
      netSalary: 3000000,
      paidAmount: 0,
      remaining: 3000000,
      status: PayrollStatus.UNPAID,
      appliedDeductions: [],
    },
    ...overrides,
  }
}

const deductionRow: StaffDeductionRow = {
  id: 7,
  userId: 50,
  amount: 100000,
  appliedAmount: 0,
  remainingAmount: 100000,
  type: StaffDeductionType.LATE,
  reason: 'Kechikish',
  sourceForMonth: '2026-09',
  settledAt: null,
  createdAt: '2026-09-20T00:00:00.000Z',
  createdBy: { id: 1, firstName: 'Admin', lastName: 'Adminov' },
}

describe('useStaffOverview', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchStaffOverview.mockResolvedValue(makeOverview())
    mockedFetchMyOverview.mockResolvedValue(makeOverview())
    mockedCreateDeduction.mockResolvedValue(deductionRow)
    mockedDeleteDeduction.mockResolvedValue(undefined)
    mockedPaySalary.mockResolvedValue(undefined)
  })

  describe('load()', () => {
    it('calls fetchStaffOverview when userId() returns a number', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      expect(mockedFetchStaffOverview).toHaveBeenCalledWith(50, '2026-09')
      expect(mockedFetchMyOverview).not.toHaveBeenCalled()
      expect(s.data.value).toEqual(makeOverview())
    })

    it('calls fetchMyOverview ("my own page") when userId() returns null', async () => {
      const s = useStaffOverview(() => null, () => '2026-09')
      await s.load()

      expect(mockedFetchMyOverview).toHaveBeenCalledWith('2026-09')
      expect(mockedFetchStaffOverview).not.toHaveBeenCalled()
    })

    it('leaves data null and does not throw on a rejected load', async () => {
      mockedFetchStaffOverview.mockRejectedValueOnce(new Error('network'))
      const s = useStaffOverview(() => 50)

      await expect(s.load()).resolves.toBeUndefined()
      expect(s.data.value).toBeNull()
      expect(s.loading.value).toBe(false)
    })
  })

  describe('month', () => {
    it('seeds month from initialMonth', () => {
      const s = useStaffOverview(() => 50, () => '2026-08')
      expect(s.month.value).toBe('2026-08')
    })

    it('defaults month to the current YYYY-MM when initialMonth is omitted', () => {
      const s = useStaffOverview(() => 50)
      const now = new Date()
      const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
      expect(s.month.value).toBe(expected)
    })

    it('setMonth updates month and reloads', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      s.setMonth('2026-08')
      await flushPromises()

      expect(s.month.value).toBe('2026-08')
      expect(mockedFetchStaffOverview).toHaveBeenCalledWith(50, '2026-08')
    })
  })

  describe('tabs', () => {
    it('exposes four tabs in order with the expected badges', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      expect(s.tabs.value.map((tab) => tab.key)).toEqual([
        StaffTab.LATE,
        StaffTab.RECEIPTS,
        StaffTab.DEDUCTIONS,
        StaffTab.MONTHS,
      ])
      const [lateTab, receiptsTab, deductionsTab, monthsTab] = s.tabs.value
      expect(lateTab?.badge).toBe(1)
      expect(receiptsTab?.badge).toBe(2)
      expect(receiptsTab?.badgeAlert).toBe(true)
      expect(deductionsTab?.badge).toBe(0)
      expect(monthsTab?.badge).toBeUndefined()
    })
  })

  describe('openPay / openDeduction', () => {
    it('openPay pre-fills the amount with the remaining salary', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.openPay()
      expect(s.pay.open).toBe(true)
      expect(s.pay.amount).toBe(3000000)
      expect(s.pay.comment).toBe('')
    })

    it('openDeduction resets the deduction form to type OTHER', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.openDeduction()
      expect(s.deduction.open).toBe(true)
      expect(s.deduction.amount).toBeNull()
      expect(s.deduction.reason).toBe('')
      expect(s.deduction.type).toBe(StaffDeductionType.OTHER)
    })
  })

  describe('payError', () => {
    it('requires a positive amount', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.pay.amount = null
      expect(s.payError.value).toBe(t('staff.salary.payPositive'))

      s.pay.amount = 0
      expect(s.payError.value).toBe(t('staff.salary.payPositive'))

      s.pay.amount = -100
      expect(s.payError.value).toBe(t('staff.salary.payPositive'))
    })

    it('rejects an amount above the remaining salary', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.pay.amount = 3000001
      expect(s.payError.value).toBe(
        t('staff.salary.payTooMuch', { amount: formatSom(3000000) }),
      )
    })

    it('is empty for a valid amount', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.pay.amount = 500000
      expect(s.payError.value).toBe('')
    })
  })

  describe('submitPay', () => {
    it('pays, notifies, closes the dialog, reloads and resolves true', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.openPay()
      s.pay.comment = '  '

      const result = await s.submitPay()

      expect(mockedPaySalary).toHaveBeenCalledWith(70, { amount: 3000000, comment: undefined })
      expect(result).toBe(true)
      expect(s.pay.open).toBe(false)
      expect(mockedFetchStaffOverview).toHaveBeenCalledTimes(2)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS && n.message === t('staff.salary.paySuccess'))).toBe(true)
    })

    it('trims a non-blank comment and sends it', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.openPay()
      s.pay.comment = '  naqd  '

      await s.submitPay()

      expect(mockedPaySalary).toHaveBeenCalledWith(70, { amount: 3000000, comment: 'naqd' })
    })

    it('resolves false and clears submitting on a rejected pay', async () => {
      mockedPaySalary.mockRejectedValueOnce(new Error('fail'))
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.openPay()

      const result = await s.submitPay()

      expect(result).toBe(false)
      expect(s.submitting.value).toBe(false)
    })

    it('is a no-op returning false when payError is non-empty', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.openPay()
      s.pay.amount = 0

      const result = await s.submitPay()

      expect(result).toBe(false)
      expect(mockedPaySalary).not.toHaveBeenCalled()
    })

    it('is a no-op returning false when there is no salary row', async () => {
      mockedFetchStaffOverview.mockResolvedValueOnce(makeOverview({ salary: null }))
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.openPay()

      const result = await s.submitPay()

      expect(result).toBe(false)
      expect(mockedPaySalary).not.toHaveBeenCalled()
    })
  })

  describe('deductionValid', () => {
    it('requires a positive amount and a non-blank reason', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      s.deduction.amount = null
      s.deduction.reason = 'sabab'
      expect(s.deductionValid.value).toBe(false)

      s.deduction.amount = 100000
      s.deduction.reason = '   '
      expect(s.deductionValid.value).toBe(false)

      s.deduction.amount = 100000
      s.deduction.reason = 'sabab'
      expect(s.deductionValid.value).toBe(true)
    })
  })

  describe('submitDeduction', () => {
    it('posts the trimmed payload, notifies, closes and reloads', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.deduction.amount = 100000
      s.deduction.reason = '  Kechikish  '
      s.deduction.type = StaffDeductionType.LATE

      const result = await s.submitDeduction()

      expect(mockedCreateDeduction).toHaveBeenCalledWith({
        userId: 50,
        amount: 100000,
        reason: 'Kechikish',
        type: StaffDeductionType.LATE,
        forMonth: '2026-09',
      })
      expect(result).toBe(true)
      expect(s.deduction.open).toBe(false)
      expect(mockedFetchStaffOverview).toHaveBeenCalledTimes(2)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS && n.message === t('staff.deduction.success'))).toBe(true)
    })

    it('falls back to data.user.id when userId() is null (my own page)', async () => {
      const s = useStaffOverview(() => null, () => '2026-09')
      await s.load()
      s.deduction.amount = 50000
      s.deduction.reason = 'sabab'

      await s.submitDeduction()

      expect(mockedCreateDeduction).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 50 }),
      )
    })

    it('is a no-op when the form is invalid', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()
      s.deduction.amount = 0
      s.deduction.reason = ''

      const result = await s.submitDeduction()

      expect(result).toBe(false)
      expect(mockedCreateDeduction).not.toHaveBeenCalled()
    })
  })

  describe('removeDeduction', () => {
    it('deletes, notifies and reloads', async () => {
      const s = useStaffOverview(() => 50, () => '2026-09')
      await s.load()

      const result = await s.removeDeduction(deductionRow)

      expect(mockedDeleteDeduction).toHaveBeenCalledWith(7)
      expect(result).toBe(true)
      expect(mockedFetchStaffOverview).toHaveBeenCalledTimes(2)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS && n.message === t('staff.deduction.deleted'))).toBe(true)
    })
  })
})
