import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AbsencesSummary from '../AbsencesSummary.vue'
import { UiStatCard } from '@/shared/components'
import { t } from '@/locales'

describe('AbsencesSummary', () => {
  it('renders the three labelled numbers', () => {
    const wrapper = mount(AbsencesSummary, { props: { summary: { absent: 4, excused: 2, notFollowedUp: 5 } } })
    const cards = wrapper.findAllComponents(UiStatCard)
    expect(cards).toHaveLength(3)

    expect(cards[0]!.text()).toContain(t('absences.summary.absent'))
    expect(cards[0]!.text()).toContain('4')
    expect(cards[1]!.text()).toContain(t('absences.summary.excused'))
    expect(cards[1]!.text()).toContain('2')
    expect(cards[2]!.text()).toContain(t('absences.summary.notFollowedUp'))
    expect(cards[2]!.text()).toContain('5')
  })
})
