import { describe, it, expect } from 'vitest'
import { CandidatePosition } from '../../enums/candidate-position.enum'
import { CandidateStatus } from '../../enums/candidate-status.enum'
import { mount } from '@vue/test-utils'
import CandidateInfoCard from '../CandidateInfoCard.vue'
import { formatPhone } from '@/shared/utils/format-phone'
import { formatDate } from '@/shared/utils/format-date'
import { t } from '@/locales'
import type { Candidate } from '../../interfaces/candidate.interface'

const candidate: Candidate = {
  id: 1,
  centerId: 5,
  firstName: 'Ali',
  lastName: 'Valiyev',
  phone: '+998977522014',
  experience: '3 yil, 21-maktab',
  birthYear: 1995,
  position: CandidatePosition.TEACHER,
  subjectId: 2,
  subject: { id: 2, name: 'Matematika' },
  status: CandidateStatus.NEW,
  hiredUserId: null,
  address: null,
  comment: "Birinchi qator\nIkkinchi qator — to'liq matn",
  createdAt: '2026-09-01T10:00:00.000Z',
  updatedAt: '2026-09-01T10:00:00.000Z',
}

describe('CandidateInfoCard', () => {
  it('renders every field with labels, the full comment and a dash for empty ones', () => {
    const wrapper = mount(CandidateInfoCard, { props: { candidate } })
    const text = wrapper.text()

    expect(text).toContain(t('candidates.detail.phone'))
    expect(text).toContain(formatPhone(candidate.phone))
    expect(text).toContain('1995')
    expect(text).toContain('Matematika')
    expect(text).toContain('3 yil, 21-maktab')
    expect(text).toContain(formatDate(candidate.createdAt))
    expect(wrapper.findAll('dd').map((d) => d.element.textContent?.trim())).toContain(candidate.comment)
    expect(wrapper.findAll('dd').some((d) => d.text() === '—')).toBe(true)
  })

  it('shows the age next to the birth year', () => {
    const wrapper = mount(CandidateInfoCard, { props: { candidate } })
    const age = new Date().getFullYear() - 1995
    expect(wrapper.text()).toContain(t('candidates.detail.age', { age }))
  })
})
