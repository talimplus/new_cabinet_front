import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffOverviewStats from '../StaffOverviewStats.vue'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StaffOverviewSummary } from '../../interfaces/staff-overview.interface'

function makeSummary(overrides: Partial<StaffOverviewSummary> = {}): StaffOverviewSummary {
  return {
    expectedDays: 22,
    attendedDays: 18,
    missedDays: 4,
    lateDays: 3,
    totalLateMinutes: 45,
    flaggedDays: 0,
    unsettledCount: 2,
    unsettledAmount: 150_000,
    rejectedCount: 0,
    rejectedAmount: 0,
    deductionThisMonth: 50_000,
    deductionOutstanding: 20_000,
    ...overrides,
  }
}

function mountStats(summary: Partial<StaffOverviewSummary> = {}) {
  return mount(StaffOverviewStats, { props: { summary: makeSummary(summary) } })
}

describe('StaffOverviewStats', () => {
  it('renders exactly four stat cards', () => {
    expect(mountStats().findAllComponents({ name: 'UiStatCard' })).toHaveLength(4)
  })

  it('shows the late-days card', () => {
    const wrapper = mountStats({ lateDays: 3 })
    expect(wrapper.text()).toContain(t('staff.stats.lateDays'))
    expect(wrapper.text()).toContain('3')
  })

  it('shows the missed-days card with the expectedDays hint', () => {
    const wrapper = mountStats({ missedDays: 4, expectedDays: 22 })
    expect(wrapper.text()).toContain(t('staff.stats.missedDays'))
    expect(wrapper.text()).toContain(t('staff.stats.missedHint', { days: 22 }))
  })

  it('shows the unsettled-money card formatted with formatSom and a count hint', () => {
    const wrapper = mountStats({ unsettledAmount: 150_000, unsettledCount: 2 })
    expect(wrapper.text()).toContain(formatSom(150_000))
    expect(wrapper.text()).toContain(t('staff.stats.unsettledHint', { count: 2 }))
  })

  it("shows this month's fine card with the deductionOutstanding hint", () => {
    const wrapper = mountStats({ deductionThisMonth: 50_000, deductionOutstanding: 20_000 })
    expect(wrapper.text()).toContain(formatSom(50_000))
    expect(wrapper.text()).toContain(t('staff.stats.deductionHint', { amount: formatSom(20_000) }))
  })
})
