import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchStaffSalaries, payStaffSalary } from '../payroll.api'
import { http } from '@/shared/api/http'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('payroll.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchStaffSalaries GETs /staff-salaries with params and returns the BARE array body', async () => {
    const list = [
      { id: 1, status: PayrollStatus.UNPAID },
      { id: 2, status: PayrollStatus.PAID },
    ] as StaffSalary[]
    mockedHttp.get.mockResolvedValueOnce({ data: list })

    const result = await fetchStaffSalaries({ forMonth: '2026-09', centerId: 5 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/staff-salaries', {
      params: { forMonth: '2026-09', centerId: 5 },
    })
    expect(result).toEqual(list)
    expect(Array.isArray(result)).toBe(true)
  })

  it('payStaffSalary PUTs /staff-salaries/pay/{id} with the amount/comment body', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await payStaffSalary(7, { amount: 500000, comment: 'avans' })

    expect(mockedHttp.put).toHaveBeenCalledWith('/staff-salaries/pay/7', {
      amount: 500000,
      comment: 'avans',
    })
  })

  it('payStaffSalary sends only the amount when no comment is given', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await payStaffSalary(3, { amount: 250000 })

    expect(mockedHttp.put).toHaveBeenCalledWith('/staff-salaries/pay/3', { amount: 250000 })
  })
})
