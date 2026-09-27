import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import DashboardMonthly from '../DashboardMonthly.vue'
import { formatSom } from '@/shared/utils/format-money'
import type { DashboardMonth, DashboardResponse } from '../../interfaces/dashboard.interface'
import { t } from '@/locales'

const normalize = (s: string) => s.replace(/\s/g, ' ')

function month(ym: string, due: number, paid: number, net: number): DashboardMonth {
  return {
    month: ym,
    payments: { amountDue: due, amountPaid: paid, remainingAmount: due - paid, refundedAmount: 0 },
    expenses: { totalAmount: 1000 },
    payroll: { amountDue: 2000, amountPaid: 2000, remainingAmount: 0 },
    netCashflow: net,
  }
}

function makeData(byMonth: DashboardMonth[]): DashboardResponse {
  return {
    centerId: 7,
    fromMonth: byMonth[0]?.month ?? '2026-09',
    toMonth: byMonth[byMonth.length - 1]?.month ?? '2026-09',
    payments: { amountDue: 0, amountPaid: 0, remainingAmount: 0, totalCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 },
    paymentsByMethod: [],
    expenses: { totalAmount: 0, totalCount: 0 },
    payroll: { amountDue: 0, amountPaid: 0, remainingAmount: 0, totalCount: 0, paidCount: 0, partialCount: 0, unpaidCount: 0 },
    students: { totalCount: 0, activeCount: 0, addedCount: 0, stoppedCount: 0 },
    netCashflow: 0,
    byMonth,
  }
}

describe('DashboardMonthly', () => {
  it('is hidden for a single month (the cards already show it)', () => {
    const wrapper = mount(DashboardMonthly, { props: { data: makeData([month('2026-08', 100, 60, 10)]) } })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('is hidden without data', () => {
    const wrapper = mount(DashboardMonthly, { props: { data: null } })
    expect(wrapper.find('section').exists()).toBe(false)
  })

  it('renders one row per month with its own amounts', () => {
    const data = makeData([month('2026-07', 65060264, 51794000, 14520500), month('2026-08', 58132923, 39147000, 2559000)])
    const wrapper = mount(DashboardMonthly, { props: { data } })
    expect(wrapper.text()).toContain(t('statistics.monthly.title'))
    const body = normalize(wrapper.get('tbody').text())
    expect(body).toContain(`${t('common.months.07')} 2026`)
    expect(body).toContain(`${t('common.months.08')} 2026`)
    expect(body).toContain(normalize(formatSom(51794000)))
    expect(body).toContain(normalize(formatSom(39147000)))
    expect(body).toContain(normalize(formatSom(58132923 - 39147000)))
    expect(wrapper.findAll('tbody tr')).toHaveLength(2)
  })

  it('tones the net cashflow by its sign', () => {
    const data = makeData([month('2026-08', 10, 10, 500), month('2026-09', 10, 0, -300)])
    const wrapper = mount(DashboardMonthly, { props: { data } })
    const cells = wrapper.findAll('tbody tr').map((tr) => {
      const tds = tr.findAll('td')
      return tds[tds.length - 1]!.get('span').classes()
    })
    expect(cells[0]).toContain('text-success')
    expect(cells[1]).toContain('text-danger')
  })
})
