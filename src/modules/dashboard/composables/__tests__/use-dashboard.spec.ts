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
  toMonth: '2026-09',
  payments: { amountDue: 200, amountPaid: 150, remainingAmount: 50, totalCount: 2, paidCount: 1, partialCount: 0, unpaidCount: 1 },
  paymentsByMethod: [],
  expenses: { totalAmount: 30, totalCount: 1 },
  payroll: { amountDue: 0, amountPaid: 0, remainingAmount: 0, totalCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 },
  students: { totalCount: 5, activeCount: 4, addedCount: 1, stoppedCount: 0 },
  netCashflow: 150,
  byMonth: [],
}

/** Default range is the current month only — both ends are inclusive on the backend. */
function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

describe('useDashboard', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchDashboard.mockResolvedValue(response)
  })

  it('init fetches a single month (current → current)', async () => {
    mockedFetchAllCenters.mockResolvedValueOnce([{ id: 7, name: 'Markaz 7', isDefault: true }])
    const { data, init } = useDashboard()

    await init()
    await flushPromises()
    await nextTick()
    await flushPromises()

    const month = currentMonth()
    expect(mockedFetchDashboard).toHaveBeenCalledWith({ fromMonth: month, toMonth: month })
    expect(month).toMatch(/^\d{4}-\d{2}$/)
    expect(data.value).toEqual(response)
  })

  it('moves the whole view when the start changes while one month is shown', async () => {
    const { range, setFromMonth } = useDashboard()
    await setFromMonth('2026-07')
    expect(range.fromMonth).toBe('2026-07')
    expect(range.toMonth).toBe('2026-07')
    expect(mockedFetchDashboard).toHaveBeenLastCalledWith({ fromMonth: '2026-07', toMonth: '2026-07' })
  })

  it('keeps a multi-month range when the start moves inside it', async () => {
    const { range, setFromMonth, setToMonth } = useDashboard()
    await setFromMonth('2026-06')
    await setToMonth('2026-09')
    await setFromMonth('2026-07')
    expect(range).toMatchObject({ fromMonth: '2026-07', toMonth: '2026-09' })
  })

  it('pulls the end forward when the start passes it', async () => {
    const { range, setFromMonth, setToMonth } = useDashboard()
    await setFromMonth('2026-06')
    await setToMonth('2026-07')
    await setFromMonth('2026-09')
    expect(range).toMatchObject({ fromMonth: '2026-09', toMonth: '2026-09' })
  })

  it('pulls the start back when the end goes before it', async () => {
    const { range, setFromMonth, setToMonth } = useDashboard()
    await setFromMonth('2026-08')
    await setToMonth('2026-06')
    expect(range).toMatchObject({ fromMonth: '2026-06', toMonth: '2026-06' })
  })

  it('ignores a cleared month input', async () => {
    const { range, setFromMonth } = useDashboard()
    const before = { ...range }
    await setFromMonth('')
    expect(range).toMatchObject(before)
    expect(mockedFetchDashboard).not.toHaveBeenCalled()
  })
})
