import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDashboard } from '../statistics.api'
import { http } from '@/shared/api/http'
import type { DashboardParams, DashboardResponse } from '../../interfaces/dashboard.interface'

// Mock the shared axios instance — API tests never hit the network.
vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('statistics.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchDashboard GETs /statistics/dashboard with params and returns the body', async () => {
    const params: DashboardParams = { centerId: 3, fromMonth: '2026-09', toMonth: '2026-10' }
    const body: DashboardResponse = {
      centerId: 3,
      fromMonth: '2026-09',
      toMonth: '2026-10',
      payments: { amountDue: 100, amountPaid: 60, remainingAmount: 40, totalCount: 3, paidCount: 1, partialCount: 0, unpaidCount: 2 },
      paymentsByMethod: [],
      expenses: { totalAmount: 20, totalCount: 1 },
      payroll: { amountDue: 0, amountPaid: 0, remainingAmount: 0, totalCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 },
      students: { totalCount: 10, activeCount: 8, addedCount: 2, stoppedCount: 1 },
      netCashflow: 60,
      byMonth: [],
    }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchDashboard(params)

    expect(mockedHttp.get).toHaveBeenCalledWith('/statistics/dashboard', { params })
    expect(result).toEqual(body)
  })
})
