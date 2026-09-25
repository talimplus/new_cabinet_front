import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardDetails from '../DashboardDetails.vue'
import { formatSom } from '@/shared/utils/format-money'
import type { DashboardResponse } from '../../interfaces/dashboard.interface'
import { t } from '@/locales'

const normalize = (s: string) => s.replace(/\s/g, ' ')

const data: DashboardResponse = {
  centerId: 1,
  fromMonth: '2026-01',
  toMonth: '2026-09',
  payments: {
    amountDue: 1000000,
    amountPaid: 600000,
    remainingAmount: 400000,
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

describe('DashboardDetails', () => {
  it('renders the three detail cards with their titles', () => {
    const wrapper = mount(DashboardDetails, { props: { data } })
    const cards = wrapper.findAllComponents({ name: 'DetailCard' })
    expect(cards).toHaveLength(3)
    const text = wrapper.text()
    expect(text).toContain(t('statistics.details.payments'))
    expect(text).toContain(t('statistics.details.expenses'))
    expect(text).toContain(t('statistics.details.payroll'))
  })

  it('shows the formatted payment amounts', () => {
    const wrapper = mount(DashboardDetails, { props: { data } })
    const text = normalize(wrapper.text())
    expect(text).toContain(normalize(formatSom(600000))) // payments.amountPaid
    expect(text).toContain(normalize(formatSom(400000))) // payments.remainingAmount
  })

  it('shows the formatted payroll amountPaid', () => {
    const wrapper = mount(DashboardDetails, { props: { data } })
    expect(normalize(wrapper.text())).toContain(normalize(formatSom(48200000)))
  })

  it('shows the expense total count', () => {
    const wrapper = mount(DashboardDetails, { props: { data } })
    expect(wrapper.text()).toContain('7')
  })

  it('renders safely with null data', () => {
    const wrapper = mount(DashboardDetails, { props: { data: null } })
    // Still renders all three cards and falls back to em dashes for amounts.
    expect(wrapper.findAllComponents({ name: 'DetailCard' })).toHaveLength(3)
    expect(wrapper.text()).toContain('—')
  })
})
