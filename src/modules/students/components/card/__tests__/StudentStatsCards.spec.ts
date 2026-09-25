import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentStatsCards from '../StudentStatsCards.vue'
import { UiStatCard } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StudentSummaryTotals } from '../../../interfaces/student-summary.interface'

const last = <T>(a: T[]): T => a[a.length - 1]!

function makeTotals(overrides: Partial<StudentSummaryTotals> = {}): StudentSummaryTotals {
  return {
    totalDue: 100000,
    totalPaid: 60000,
    totalDebt: 40000,
    totalPending: 0,
    totalReceived: 60000,
    payableNow: 40000,
    ...overrides,
  }
}

function mountCards(totals: StudentSummaryTotals | null) {
  return mount(StudentStatsCards, { props: { totals } })
}

describe('StudentStatsCards', () => {
  it('renders 3 base cards plus the payable-now card (4 total) without pending', () => {
    const wrapper = mountCards(makeTotals({ totalPending: 0 }))
    const cards = wrapper.findAllComponents(UiStatCard)
    expect(cards).toHaveLength(4)
    expect(last(cards).props('label')).toBe(t('students.view.stats.payableNow'))
  })

  it('adds a 5th pending card only when totalPending > 0, kept before payable-now', () => {
    const wrapper = mountCards(makeTotals({ totalPending: 5000 }))
    const cards = wrapper.findAllComponents(UiStatCard)
    expect(cards).toHaveLength(5)
    expect(last(cards).props('label')).toBe(t('students.view.stats.payableNow'))

    const pendingCard = cards.find((c) => c.props('label') === t('students.view.stats.totalPending'))
    expect(pendingCard).toBeDefined()
    expect(pendingCard!.props('hint')).toBe(t('students.view.stats.totalPendingHint'))
    expect(pendingCard!.props('value')).toBe(formatSom(5000))
  })

  it('tones the debt card danger when > 0 and neutral when 0', () => {
    const withDebt = mountCards(makeTotals({ totalDebt: 1000 }))
    const debtCard = withDebt
      .findAllComponents(UiStatCard)
      .find((c) => c.props('label') === t('students.view.stats.totalDebt'))
    expect(debtCard!.props('tone')).toBe('danger')

    const noDebt = mountCards(makeTotals({ totalDebt: 0 }))
    const noDebtCard = noDebt
      .findAllComponents(UiStatCard)
      .find((c) => c.props('label') === t('students.view.stats.totalDebt'))
    expect(noDebtCard!.props('tone')).toBe('neutral')
  })

  it('formats every value with formatSom, defaulting to 0 when totals is null', () => {
    const wrapper = mountCards(null)
    const cards = wrapper.findAllComponents(UiStatCard)
    expect(cards).toHaveLength(4)
    cards.forEach((c) => expect(c.props('value')).toBe(formatSom(0)))
  })
})
