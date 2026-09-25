import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { usePayroll } from '../use-payroll'
import {
  fetchStaffSalaries as fetchStaffSalariesApi,
  payStaffSalary as payStaffSalaryApi,
} from '../../api/payroll.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'

vi.mock('../../api/payroll.api', () => ({
  fetchStaffSalaries: vi.fn(),
  payStaffSalary: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchStaffSalariesApi)
const mockedPay = vi.mocked(payStaffSalaryApi)


function makeSalary(overrides: Partial<StaffSalary> = {}): StaffSalary {
  return {
    id: 1,
    userId: 10,
    forMonth: '2026-09',
    baseSalary: 2_000_000,
    paidAmount: 0,
    status: PayrollStatus.UNPAID,
    paidAt: null,
    comment: null,
    createdAt: '2026-01-01',
    user: {
      id: 10, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998',
      role: 'manager', salary: 2_000_000, commissionPercentage: null, createdAt: '2026-01-01',
    },
    ...overrides,
  }
}

const teacher = () =>
  makeSalary({ id: 2, baseSalary: 0, earningCommissionAmount: 800_000, earningTotalEarning: 3_500_000 })

describe('usePayroll', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue([makeSalary()])
    mockedPay.mockResolvedValue(undefined)
  })


  it('composes forMonth as YYYY-MM', async () => {
    const p = usePayroll()
    p.setYear(2026)
    p.setMonth('03')
    await flushPromises()

    expect(p.forMonth.value).toBe('2026-03')
    expect(mockedFetch).toHaveBeenLastCalledWith({ forMonth: '2026-03' })
  })

  it('getTotalSalary/getRemaining differ for teacher vs non-teacher', () => {
    const p = usePayroll()
    const manager = makeSalary({ baseSalary: 2_000_000, paidAmount: 500_000 })
    expect(p.getTotalSalary(manager)).toBe(2_000_000)
    expect(p.getRemaining(manager)).toBe(1_500_000)

    const t = teacher()
    expect(p.getTotalSalary(t)).toBe(3_500_000)
    expect(p.getRemaining(t)).toBe(3_500_000)
  })

  it('showCommission is true only when a teacher row is present', async () => {
    const p = usePayroll()

    mockedFetch.mockResolvedValueOnce([makeSalary()])
    await p.load()
    expect(p.showCommission.value).toBe(false)

    mockedFetch.mockResolvedValueOnce([teacher()])
    await p.load()
    expect(p.showCommission.value).toBe(true)
  })

  it('openPay seeds the amount with the remaining and confirmPay pays, notifies, reloads', async () => {
    const p = usePayroll()
    const staff = makeSalary({ id: 42, baseSalary: 2_000_000, paidAmount: 500_000 })

    p.openPay(staff)
    expect(p.pay.open).toBe(true)
    expect(p.pay.amount).toBe(1_500_000)

    p.pay.comment = '  bonus  '
    await p.confirmPay()
    await flushPromises()

    expect(mockedPay).toHaveBeenCalledWith(42, { amount: 1_500_000, comment: 'bonus' })
    expect(p.pay.open).toBe(false)
    expect(mockedFetch).toHaveBeenCalled() // reloaded after paying
    const notify = useNotificationStore()
    expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })

  it('confirmPay omits the comment when it is blank', async () => {
    const p = usePayroll()
    p.openPay(makeSalary({ id: 9 }))
    p.pay.comment = '   '
    await p.confirmPay()

    expect(mockedPay).toHaveBeenCalledWith(9, { amount: expect.any(Number), comment: undefined })
  })
})
