import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffAttendanceTable from '../StaffAttendanceTable.vue'
import { AttendanceConfidence, AttendanceSource } from '@/shared/enums/attendance-confidence.enum'
import { AttendanceFlag } from '@/shared/enums/attendance-flag.enum'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'
import { t } from '@/locales'

function makeAttendance(overrides: Partial<StaffAttendance> = {}): StaffAttendance {
  return {
    id: 1,
    userId: 10,
    centerId: 1,
    workDate: '2026-09-24',
    checkInAt: '2026-09-24T04:10:00.000Z',
    firstLessonAt: null,
    lateMinutes: 0,
    source: AttendanceSource.SELF,
    confidence: AttendanceConfidence.HIGH,
    distanceMeters: null,
    geoMatched: true,
    ipMatched: true,
    flags: [],
    confirmedByUserId: null,
    confirmedAt: null,
    note: null,
    user: { id: 10, firstName: 'Ali', lastName: 'Valiyev' },
    ...overrides,
  }
}

function mountTable(rows: StaffAttendance[], canManage = false) {
  return mount(StaffAttendanceTable, { props: { rows, loading: false, canManage } })
}

describe('StaffAttendanceTable', () => {
  it('renders the employee full name, or a dash without a user', () => {
    const withUser = mountTable([makeAttendance()])
    expect(withUser.get('tbody').text()).toContain('Ali Valiyev')

    const withoutUser = mountTable([makeAttendance({ user: null })])
    const cell = withoutUser.get('tbody tr').findAll('td')[0]!
    expect(cell.text()).toBe('—')
  })

  it('formats the work date', () => {
    const wrapper = mountTable([makeAttendance({ workDate: '2026-09-24' })])
    expect(wrapper.get('tbody').text()).toContain('24.09.2026')
  })

  it('shows the lesson-at caption only when firstLessonAt is set', () => {
    const withLesson = mountTable([makeAttendance({ firstLessonAt: '09:30:00' })])
    expect(withLesson.get('tbody').text()).toContain(t('staffAttendance.table.lessonAt', { time: '09:30' }))

    const withoutLesson = mountTable([makeAttendance({ firstLessonAt: null })])
    expect(withoutLesson.get('tbody').text()).not.toContain('dars:')
  })

  it('shows the late minutes in a warning span, or a dash when not late', () => {
    const late = mountTable([makeAttendance({ lateMinutes: 12 })])
    const lateCell = late.get('tbody tr').findAll('td')[3]!
    expect(lateCell.text()).toContain(`+12 ${t('staffAttendance.minutesShort')}`)
    expect(lateCell.html()).toContain('text-warning')

    const onTime = mountTable([makeAttendance({ lateMinutes: 0 })])
    const onTimeCell = onTime.get('tbody tr').findAll('td')[3]!
    expect(onTimeCell.text()).toBe('—')
  })

  it('renders a confidence badge with the matching label', () => {
    const wrapper = mountTable([makeAttendance({ confidence: AttendanceConfidence.LOW })])
    expect(wrapper.get('tbody').text()).toContain(t('staffAttendance.confidence.low'))
  })

  it('joins visible flags with " · " and hides no_lesson_today', () => {
    const wrapper = mountTable([
      makeAttendance({ flags: [AttendanceFlag.FAR_FROM_CENTER, AttendanceFlag.IP_MISMATCH, AttendanceFlag.NO_LESSON_TODAY] }),
    ])
    const text = wrapper.get('tbody').text()
    expect(text).toContain(
      `${t('staffAttendance.flags.far_from_center')} · ${t('staffAttendance.flags.ip_mismatch')}`,
    )
    expect(text).not.toContain(t('staffAttendance.flags.no_lesson_today'))
  })

  it('renders no flag caption when there are no visible flags', () => {
    const wrapper = mountTable([makeAttendance({ flags: [AttendanceFlag.NO_LESSON_TODAY] })])
    expect(wrapper.get('tbody').text()).not.toContain('·')
  })

  it('renders the source label', () => {
    const wrapper = mountTable([makeAttendance({ source: AttendanceSource.MANUAL })])
    expect(wrapper.get('tbody').text()).toContain(t('staffAttendance.source.manual'))
  })

  it('shows the confirmed icon only when confirmedAt is set', () => {
    const confirmed = mountTable([makeAttendance({ confirmedAt: '2026-09-24T05:00:00.000Z' })])
    expect(confirmed.get('tbody').find('.lucide-shield-check').exists()).toBe(true)

    const unconfirmed = mountTable([makeAttendance({ confirmedAt: null })])
    expect(unconfirmed.get('tbody').find('.lucide-shield-check').exists()).toBe(false)
  })

  describe('row actions', () => {
    it('shows neither action when canManage is false', () => {
      const wrapper = mountTable([makeAttendance()], false)
      expect(wrapper.get('tbody').find(`[aria-label="${t('staffAttendance.confirmAction')}"]`).exists()).toBe(false)
      expect(wrapper.get('tbody').find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
    })

    it('shows the confirm action only when canManage and not yet confirmed, and emits confirm', async () => {
      const row = makeAttendance({ id: 3, confirmedAt: null })
      const wrapper = mountTable([row], true)
      const confirmButton = wrapper.get('tbody').get(`[aria-label="${t('staffAttendance.confirmAction')}"]`)
      await confirmButton.trigger('click')
      expect(wrapper.emitted('confirm')?.[0]).toEqual([row])

      const confirmedRow = makeAttendance({ id: 4, confirmedAt: '2026-09-24T05:00:00.000Z' })
      const confirmedWrapper = mountTable([confirmedRow], true)
      expect(
        confirmedWrapper.get('tbody').find(`[aria-label="${t('staffAttendance.confirmAction')}"]`).exists(),
      ).toBe(false)
    })

    it('shows the delete action when canManage and emits delete', async () => {
      const row = makeAttendance({ id: 5 })
      const wrapper = mountTable([row], true)
      const deleteButton = wrapper.get('tbody').get(`[aria-label="${t('common.delete')}"]`)
      await deleteButton.trigger('click')
      expect(wrapper.emitted('delete')?.[0]).toEqual([row])
    })
  })
})
