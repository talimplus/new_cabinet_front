import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentGroupRow from '../StudentGroupRow.vue'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StudentSummaryGroup } from '../../../interfaces/student-summary.interface'

function makeGroup(overrides: Partial<StudentSummaryGroup> = {}): StudentSummaryGroup {
  return { id: 1, name: 'Group A', monthlyFee: 400000, ...overrides }
}

function mountRow(props: Record<string, unknown> = {}) {
  return mount(StudentGroupRow, { props: { group: makeGroup(), ...props } })
}

describe('StudentGroupRow', () => {
  it('renders the group name and formatted monthly fee', () => {
    const text = mountRow().text()
    expect(text).toContain('Group A')
    expect(text).toContain(formatSom(400000))
  })

  it('joins the schedule as "<weekday> HH:mm" with the seconds trimmed', () => {
    const text = mountRow({
      group: makeGroup({
        schedule: [
          { day: WeekDay.MONDAY, startTime: '10:00:00' },
          { day: WeekDay.WEDNESDAY, startTime: '14:30:00' },
        ],
      }),
    }).text()
    const expected = `${t(WEEK_DAY_LABEL_KEYS[WeekDay.MONDAY])} 10:00, ${t(WEEK_DAY_LABEL_KEYS[WeekDay.WEDNESDAY])} 14:30`
    expect(text).toContain(expected)
  })

  it('renders no dot-separated schedule text without a schedule', () => {
    expect(mountRow({ group: makeGroup({ schedule: undefined }) }).text()).not.toContain('·')
    expect(mountRow({ group: makeGroup({ schedule: [] }) }).text()).not.toContain('·')
  })

  it('shows the transfer button only with canTransfer and emits transfer with the group', async () => {
    expect(mountRow({ canTransfer: false }).findAll('button')).toHaveLength(0)

    const group = makeGroup({ id: 9 })
    const wrapper = mountRow({ group, canTransfer: true })
    const button = wrapper.get('button')
    expect(button.text()).toContain(t('students.transfer.action'))
    await button.trigger('click')
    expect(wrapper.emitted('transfer')?.[0]).toEqual([group])
  })
})
