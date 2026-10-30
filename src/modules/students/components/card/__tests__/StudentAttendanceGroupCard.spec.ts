import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentAttendanceGroupCard from '../StudentAttendanceGroupCard.vue'
import { GroupStatus } from '@/modules/groups/enums/group-status.enum'
import { t } from '@/locales'

const group = {
  groupId: 1, groupName: 'A1', groupStatus: GroupStatus.STARTED,
  joinedAt: '2026-09-01', leftAt: '2026-10-20', transferredToGroupName: 'B2', isCurrent: false,
  counts: { present: 10, absent: 2, late: 1, excused: 0, total: 13 },
}

describe('StudentAttendanceGroupCard', () => {
  it('shows a former group with its period, transfer target and counts', () => {
    const w = mount(StudentAttendanceGroupCard, { props: { group } })
    const text = w.text()
    expect(text).toContain('A1')
    expect(text).toContain(t('students.attendanceHistory.former'))
    expect(text).toContain('01.09.2026')
    expect(text).toContain('20.10.2026')
    expect(text).toContain(t('students.attendanceHistory.transferredTo', { name: 'B2' }))
    expect(text).toContain('10')
  })

  it('a current group reads "until now" and emits select on click', async () => {
    const w = mount(StudentAttendanceGroupCard, {
      props: { group: { ...group, isCurrent: true, leftAt: null, transferredToGroupName: null } },
    })
    expect(w.text()).toContain(t('students.attendanceHistory.current'))
    expect(w.text()).toContain(t('students.attendanceHistory.now'))
    await w.get('button').trigger('click')
    expect(w.emitted('select')).toHaveLength(1)
  })
})
