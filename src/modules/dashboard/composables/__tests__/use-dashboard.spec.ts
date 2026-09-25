import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import { useDashboard } from '../use-dashboard'
import { fetchDashboard as fetchDashboardApi } from '../../api/statistics.api'
import { fetchAllCenters as fetchAllCentersApi } from '@/modules/centers/api/centers.api'
import type { DashboardResponse } from '../../interfaces/dashboard.interface'

// Mock both the dashboard api and the centers api the scope store depends on.
vi.mock('../../api/statistics.api', () => ({ fetchDashboard: vi.fn() }))
vi.mock('@/modules/centers/api/centers.api', () => ({ fetchAllCenters: vi.fn() }))

const mockedFetchDashboard = vi.mocked(fetchDashboardApi)
const mockedFetchAllCenters = vi.mocked(fetchAllCentersApi)

const response: DashboardResponse = {
  centerId: 7,
  fromMonth: '2026-09',
  toMonth: '2026-10',
  payments: { amountDue: 200, amountPaid: 150, remainingAmount: 50, totalCount: 2, paidCount: 1, partialCount: 0, unpaidCount: 1 },
  paymentsByMethod: [],
  expenses: { totalAmount: 30, totalCount: 1 },
  payroll: { amountDue: 0, amountPaid: 0, remainingAmount: 0, totalCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 },
  students: { totalCount: 5, activeCount: 4, addedCount: 1, stoppedCount: 0 },
  netCashflow: 150,
}

/** Default range is current month → next month, both `YYYY-MM`. */
function expectedRange(): { fromMonth: string; toMonth: string } {
  const now = new Date()
  const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  return { fromMonth: ym(now), toMonth: ym(new Date(now.getFullYear(), now.getMonth() + 1, 1)) }
}

describe('useDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchDashboard.mockResolvedValue(response)
  })

  it('init fetches the dashboard for the active period', async () => {
    mockedFetchAllCenters.mockResolvedValueOnce([{ id: 7, name: 'Markaz 7', isDefault: true }])
    const { data, init } = useDashboard()

    await init()
    await flushPromises()
    await nextTick()
    await flushPromises()

    const { fromMonth, toMonth } = expectedRange()
    expect(mockedFetchDashboard).toHaveBeenCalledWith({ fromMonth, toMonth })
    expect(fromMonth).toMatch(/^\d{4}-\d{2}$/)
    expect(data.value).toEqual(response)
  })

})
