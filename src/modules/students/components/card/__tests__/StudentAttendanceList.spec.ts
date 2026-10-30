import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentAttendanceList from '../StudentAttendanceList.vue'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { t } from '@/locales'

const items = [
  { id: 1, lessonDate: '2026-10-07', groupId: 1, groupName: 'A1', status: AttendanceStatus.ABSENT, comment: 'kasal', submittedBy: 'Ustoz' },
]

describe('StudentAttendanceList', () => {
  it('renders each mark with date, group, status, comment and who marked it', () => {
    const w = mount(StudentAttendanceList, { props: { items, remaining: 0 } })
    const text = w.text()
    expect(text).toContain('07.10.2026')
    expect(text).toContain('A1')
    expect(text).toContain(t('groups.attendance.status.absent'))
    expect(text).toContain('kasal')
    expect(text).toContain('Ustoz')
  })

  it('shows "no marks" when empty and a show-more button when more remain', async () => {
    expect(mount(StudentAttendanceList, { props: { items: [], remaining: 0 } }).text()).toContain(
      t('students.attendanceHistory.noMarks'),
    )
    const w = mount(StudentAttendanceList, { props: { items, remaining: 5 } })
    await w.get('button').trigger('click')
    expect(w.emitted('show-more')).toHaveLength(1)
  })
})
