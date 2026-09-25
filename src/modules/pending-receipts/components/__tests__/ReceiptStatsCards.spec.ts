import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReceiptStatsCards from '../ReceiptStatsCards.vue'
import { UiStatCard } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { ReceiptsStatsResponse } from '../../interfaces/receipts-stats.interface'
import { t } from '@/locales'

function makeStats(overrides: Partial<ReceiptsStatsResponse> = {}): ReceiptsStatsResponse {
  return {
    confirmed: { count: 3, amount: 300000 },
    pending: { count: 2, amount: 200000 },
    rejected: { count: 1, amount: 100000 },
    total: { count: 5, amount: 500000 },
    ...overrides,
  }
}

describe('ReceiptStatsCards', () => {
  it('renders four cards in confirmed / pending / rejected / total order', () => {
    const wrapper = mount(ReceiptStatsCards, { props: { stats: makeStats() } })
    const cards = wrapper.findAllComponents(UiStatCard)

    expect(cards).toHaveLength(4)
    expect(cards[0]!.props('label')).toBe(t('pendingReceipts.stats.confirmed'))
    expect(cards[1]!.props('label')).toBe(t('pendingReceipts.stats.pending'))
    expect(cards[2]!.props('label')).toBe(t('pendingReceipts.stats.rejected'))
    expect(cards[3]!.props('label')).toBe(t('pendingReceipts.stats.total'))
  })

  it('shows each card formatted amount and a count hint', () => {
    const wrapper = mount(ReceiptStatsCards, { props: { stats: makeStats() } })
    const cards = wrapper.findAllComponents(UiStatCard)

    expect(cards[0]!.props('value')).toBe(formatSom(300000))
    expect(cards[0]!.props('hint')).toBe(t('pendingReceipts.stats.count', { count: 3 }))
    expect(cards[1]!.props('value')).toBe(formatSom(200000))
    expect(cards[1]!.props('hint')).toBe(t('pendingReceipts.stats.count', { count: 2 }))
    expect(cards[2]!.props('value')).toBe(formatSom(100000))
    expect(cards[2]!.props('hint')).toBe(t('pendingReceipts.stats.count', { count: 1 }))
  })

  it('gives the total card the totalHint instead of a count', () => {
    const wrapper = mount(ReceiptStatsCards, { props: { stats: makeStats() } })
    const total = wrapper.findAllComponents(UiStatCard)[3]!

    expect(total.props('value')).toBe(formatSom(500000))
    expect(total.props('hint')).toBe(t('pendingReceipts.stats.totalHint'))
  })

  it('renders every value as an em dash while loading, instead of a stale zero', () => {
    const wrapper = mount(ReceiptStatsCards, {
      props: { stats: makeStats(), loading: true },
    })
    const cards = wrapper.findAllComponents(UiStatCard)

    for (const card of cards) {
      expect(card.props('value')).toBe('—')
    }
  })
})
