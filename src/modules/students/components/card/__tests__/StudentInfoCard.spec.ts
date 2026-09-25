import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentInfoCard from '../StudentInfoCard.vue'
import StudentGroupRow from '../StudentGroupRow.vue'
import { StudentStatus } from '../../../enums/student-status.enum'
import { StudentPreferredTime, PREFERRED_TIME_LABEL_KEYS } from '../../../enums/student-preferred-time.enum'
import { WeekDay, WEEK_DAY_LABEL_KEYS } from '@/modules/groups/enums/week-day.enum'
import { formatDate } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { StudentSummaryGroup, StudentSummaryProfile } from '../../../interfaces/student-summary.interface'

function makeStudent(overrides: Partial<StudentSummaryProfile> = {}): StudentSummaryProfile {
  return {
    id: 1,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '1',
    status: StudentStatus.ACTIVE,
    monthlyFee: 0,
    discountPercent: 0,
    centerId: 1,
    groups: [],
    ...overrides,
  }
}

function mountCard(props: Record<string, unknown> = {}) {
  return mount(StudentInfoCard, { props: { student: makeStudent(), ...props } })
}

describe('StudentInfoCard', () => {
  it('renders subject / centerName / birthDate / preferredTime / discount', () => {
    const text = mountCard({
      student: makeStudent({
        subject: { id: 1, name: 'Math' } as StudentSummaryProfile['subject'],
        centerName: 'Chilonzor',
        birthDate: '2010-05-04',
        preferredTime: StudentPreferredTime.MORNING,
        discountPercent: 10,
      }),
    }).text()
    expect(text).toContain('Math')
    expect(text).toContain('Chilonzor')
    expect(text).toContain(formatDate('2010-05-04'))
    expect(text).toContain(t(PREFERRED_TIME_LABEL_KEYS[StudentPreferredTime.MORNING]))
    expect(text).toContain('10%')
  })

  it('falls back to "—" for each field when absent', () => {
    const text = mountCard().text()
    expect(text).toContain('—')
    // subject / center / birthDate / preferredTime / discount(0) all missing
    expect((text.match(/—/g) ?? []).length).toBeGreaterThanOrEqual(5)
  })

  it('shows "—" for a 0% discount and "10%" for a 10% discount', () => {
    expect(mountCard({ student: makeStudent({ discountPercent: 0 }) }).text()).not.toContain('0%')
    expect(mountCard({ student: makeStudent({ discountPercent: 10 }) }).text()).toContain('10%')
  })

  it('renders preferredDays as badges and "—" when empty', () => {
    const withDays = mountCard({
      student: makeStudent({ preferredDays: [WeekDay.MONDAY, WeekDay.TUESDAY] }),
    })
    expect(withDays.text()).toContain(t(WEEK_DAY_LABEL_KEYS[WeekDay.MONDAY]))
    expect(withDays.text()).toContain(t(WEEK_DAY_LABEL_KEYS[WeekDay.TUESDAY]))

    const noDays = mountCard({ student: makeStudent({ preferredDays: [] }) })
    expect(noDays.text()).toContain('—')
  })

  it('renders one StudentGroupRow per group, or the no-groups message', () => {
    const groups: StudentSummaryGroup[] = [
      { id: 1, name: 'Group A', monthlyFee: 100000 },
      { id: 2, name: 'Group B', monthlyFee: 200000 },
    ]
    const withGroups = mountCard({ student: makeStudent({ groups }) })
    expect(withGroups.findAllComponents(StudentGroupRow)).toHaveLength(2)
    expect(withGroups.text()).not.toContain(t('students.view.info.noGroups'))

    const noGroups = mountCard({ student: makeStudent({ groups: [] }) })
    expect(noGroups.findAllComponents(StudentGroupRow)).toHaveLength(0)
    expect(noGroups.text()).toContain(t('students.view.info.noGroups'))
  })

  it('bubbles a group transfer event', async () => {
    const group: StudentSummaryGroup = { id: 5, name: 'Group C', monthlyFee: 100000 }
    const wrapper = mountCard({ student: makeStudent({ groups: [group] }), canTransfer: true })
    await wrapper.findComponent(StudentGroupRow).vm.$emit('transfer', group)
    expect(wrapper.emitted('transfer')?.[0]).toEqual([group])
  })
})
