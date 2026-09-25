import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentDaysCell from '../StudentDaysCell.vue'
import { UiBadge } from '@/shared/components'
import { WeekDay, WEEK_DAY_SHORT_KEYS } from '@/modules/groups/enums/week-day.enum'
import { t } from '@/locales'

describe('StudentDaysCell', () => {
  it('renders "—" when days is undefined', () => {
    const wrapper = mount(StudentDaysCell, { props: {} })

    expect(wrapper.text()).toBe('—')
    expect(wrapper.findAllComponents(UiBadge)).toHaveLength(0)
  })

  it('renders "—" when days is an empty array', () => {
    const wrapper = mount(StudentDaysCell, { props: { days: [] } })

    expect(wrapper.text()).toBe('—')
    expect(wrapper.findAllComponents(UiBadge)).toHaveLength(0)
  })

  it('renders one badge per day with the short weekday label', () => {
    const days = [WeekDay.MONDAY, WeekDay.WEDNESDAY, WeekDay.FRIDAY]
    const wrapper = mount(StudentDaysCell, { props: { days } })

    const badges = wrapper.findAllComponents(UiBadge)
    expect(badges).toHaveLength(days.length)
    badges.forEach((badge, index) => {
      expect(badge.text()).toBe(t(WEEK_DAY_SHORT_KEYS[days[index]!]))
    })
    expect(wrapper.text()).not.toContain('—')
  })

  it('renders a badge for every day of the week when all are provided', () => {
    const days = Object.values(WeekDay)
    const wrapper = mount(StudentDaysCell, { props: { days } })

    const badges = wrapper.findAllComponents(UiBadge)
    expect(badges).toHaveLength(days.length)
    expect(badges.map((b) => b.text())).toEqual(
      days.map((d) => t(WEEK_DAY_SHORT_KEYS[d])),
    )
  })
})
