import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AbsencesTable from '../AbsencesTable.vue'
import { AttendanceStatus, ATTENDANCE_STATUS_LABEL_KEYS } from '@/modules/groups/enums/attendance-status.enum'
import type { Absence } from '../../interfaces/absence.interface'
import { t } from '@/locales'

function makeAbsence(overrides: Partial<Absence> = {}): Absence {
  return {
    id: 1,
    lessonDate: '2026-09-24',
    status: AttendanceStatus.ABSENT,
    comment: null,
    followUpNote: null,
    followedUpAt: null,
    followedUpBy: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: null },
    group: { id: 3, name: 'English A1' },
    teacher: { id: 10, firstName: 'Olim', lastName: 'Karimov' },
    absencesInRange: 1,
    ...overrides,
  }
}

function mountTable(rows: Absence[], canManage = true) {
  return mount(AbsencesTable, { props: { rows, loading: false, canManage } })
}

describe('AbsencesTable', () => {
  it('renders the student full name', () => {
    const wrapper = mountTable([makeAbsence()])
    expect(wrapper.get('tbody').text()).toContain('Ali Valiyev')
  })

  it('renders tel: links for phone and secondPhone', () => {
    const wrapper = mountTable([
      makeAbsence({
        student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: '998907654321' },
      }),
    ])
    const links = wrapper.get('tbody').findAll('a[href^="tel:"]')
    expect(links.map((a) => a.attributes('href'))).toEqual(['tel:998901234567', 'tel:998907654321'])
    expect(links[0]!.text()).toBe('998901234567')
  })

  it('renders no tel: links when the student has no phones', () => {
    const wrapper = mountTable([
      makeAbsence({ student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: null, secondPhone: null } }),
    ])
    expect(wrapper.get('tbody').findAll('a[href^="tel:"]')).toHaveLength(0)
  })

  it('renders the group name and the teacher name', () => {
    const wrapper = mountTable([makeAbsence()])
    const text = wrapper.get('tbody').text()
    expect(text).toContain('English A1')
    expect(text).toContain('Olim Karimov')
  })

  it('renders the formatted lesson date', () => {
    const wrapper = mountTable([makeAbsence({ lessonDate: '2026-09-24' })])
    expect(wrapper.get('tbody').text()).toContain('24.09.2026')
  })

  it('renders the status badge label', () => {
    const absent = mountTable([makeAbsence({ status: AttendanceStatus.ABSENT })])
    expect(absent.get('tbody').text()).toContain(t(ATTENDANCE_STATUS_LABEL_KEYS[AttendanceStatus.ABSENT]))

    const excused = mountTable([makeAbsence({ status: AttendanceStatus.EXCUSED })])
    expect(excused.get('tbody').text()).toContain(t(ATTENDANCE_STATUS_LABEL_KEYS[AttendanceStatus.EXCUSED]))
  })

  it('renders the teacher comment and the follow-up note', () => {
    const wrapper = mountTable([
      makeAbsence({
        comment: 'Kasal',
        followUpNote: 'Ertaga keladi',
        followedUpAt: '2026-09-24T10:00:00.000Z',
        followedUpBy: { id: 2, firstName: 'Zarina', lastName: 'Aliyeva' },
      }),
    ])
    const text = wrapper.get('tbody').text()
    expect(text).toContain(`${t('absences.table.teacherNote')}: Kasal`)
    expect(text).toContain('Ertaga keladi')
    expect(text).toContain('Zarina Aliyeva')
  })

  it('shows the "N times" badge only when absencesInRange > 1', () => {
    const once = mountTable([makeAbsence({ absencesInRange: 1 })])
    expect(once.get('tbody').text()).not.toContain(t('absences.table.times'))

    const many = mountTable([makeAbsence({ absencesInRange: 3 })])
    expect(many.get('tbody').text()).toContain(`3 ${t('absences.table.times')}`)
  })

  describe('follow-up action', () => {
    it('reads "record" when there is no follow-up note', () => {
      const wrapper = mountTable([makeAbsence({ followUpNote: null })])
      const button = wrapper.get('tbody').get('button')
      expect(button.text()).toBe(t('absences.table.record'))
    })

    it('reads "edit" when a follow-up note exists', () => {
      const wrapper = mountTable([makeAbsence({ followUpNote: 'Ertaga keladi' })])
      const button = wrapper.get('tbody').get('button')
      expect(button.text()).toBe(t('absences.table.edit'))
    })

    it('is hidden when canManage is false', () => {
      const wrapper = mountTable([makeAbsence()], false)
      expect(wrapper.get('tbody').find('button').exists()).toBe(false)
    })

    it('emits follow-up with the row when clicked', async () => {
      const row = makeAbsence({ id: 7 })
      const wrapper = mountTable([row])
      await wrapper.get('tbody').get('button').trigger('click')
      expect(wrapper.emitted('follow-up')?.[0]).toEqual([row])
    })
  })
})
