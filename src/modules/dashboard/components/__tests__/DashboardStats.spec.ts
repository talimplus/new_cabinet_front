import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardStats from '../DashboardStats.vue'
import type { DashboardResponse } from '../../interfaces/dashboard.interface'

const data: DashboardResponse = {
  centerId: 1,
  fromMonth: '2026-01',
  toMonth: '2026-09',
  payments: {
    amountDue: 1000,
    amountPaid: 600,
    remainingAmount: 400,
    totalCount: 10,
    paidCount: 6,
    partialCount: 1,
    unpaidCount: 3,
  },
  paymentsByMethod: [],
  expenses: { totalAmount: 250000, totalCount: 7 },
  payroll: {
    amountDue: 60000000,
    amountPaid: 48200000,
    remainingAmount: 11800000,
    totalCount: 4,
    paidCount: 3,
    partialCount: 0,
    unpaidCount: 1,
  },
  students: { totalCount: 128, activeCount: 90, addedCount: 12, stoppedCount: 5 },
  netCashflow: 500,
}

describe('DashboardStats', () => {
  it('renders one StatCard per tile', () => {
    const wrapper = mount(DashboardStats, { props: { data } })
    expect(wrapper.findAllComponents({ name: 'UiStatCard' })).toHaveLength(6)
  })

  it('shows the six student/payroll/expense values from a full data object', () => {
    const wrapper = mount(DashboardStats, { props: { data } })
    const text = wrapper.text()
    expect(text).toContain('128') // students.totalCount
    expect(text).toContain('90') // students.activeCount
    expect(text).toContain('12') // students.addedCount
    expect(text).toContain('5') // students.stoppedCount
    expect(text).toContain('48.2M') // payroll.amountPaid, short form
    expect(text).toContain('7') // expenses.totalCount
  })

  it('shows zeros for counts when data is null', () => {
    const wrapper = mount(DashboardStats, { props: { data: null } })
    const cards = wrapper.findAllComponents({ name: 'UiStatCard' })
    expect(cards).toHaveLength(6)
    // The four count tiles render "0".
    const zeroValues = cards.filter((c) => c.props('value') === '0')
    expect(zeroValues.length).toBeGreaterThanOrEqual(4)
    // Ish haqi (amountPaid) falls back to the em dash when there is no data.
    expect(wrapper.text()).toContain('—')
  })
})
