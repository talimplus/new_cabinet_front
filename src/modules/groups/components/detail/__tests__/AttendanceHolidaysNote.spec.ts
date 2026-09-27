import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AttendanceHolidaysNote from '../AttendanceHolidaysNote.vue'
import { t } from '@/locales'
import { formatDate } from '@/shared/utils/format-date'
import type { LessonDatesHoliday } from '../../../interfaces/attendance.interface'

function mountNote(holidays: LessonDatesHoliday[]) {
  return mount(AttendanceHolidaysNote, { props: { holidays } })
}

describe('AttendanceHolidaysNote', () => {
  it('renders nothing when there are no holidays', () => {
    const wrapper = mountNote([])
    expect(wrapper.text()).toBe('')
    expect(wrapper.find('div').exists()).toBe(false)
  })

  it('renders the note label, the name and the formatted range', () => {
    const text = mountNote([{ fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z" }]).text()
    expect(text).toContain(t('holidays.journalNote'))
    expect(text).toContain("Navro'z")
    expect(text).toContain(`${formatDate('2026-03-21')} – ${formatDate('2026-03-23')}`)
  })

  it('shows a single date for a one-day holiday', () => {
    const text = mountNote([{ fromDate: '2026-09-01', toDate: '2026-09-01', name: 'Mustaqillik' }]).text()
    expect(text).toContain(`Mustaqillik (${formatDate('2026-09-01')})`)
    expect(text).not.toContain('–')
  })

  it('lists every holiday', () => {
    const wrapper = mountNote([
      { fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z" },
      { fromDate: '2026-03-30', toDate: '2026-03-30', name: 'Hayit' },
    ])
    expect(wrapper.findAll('.font-mono')).toHaveLength(2)
    expect(wrapper.text()).toContain('Hayit')
  })
})
