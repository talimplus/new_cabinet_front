import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CandidatesTable from '../CandidatesTable.vue'
import { formatPhone } from '@/shared/utils/format-phone'
import { formatDate } from '@/shared/utils/format-date'
import type { Candidate } from '../../interfaces/candidate.interface'
import { t } from '@/locales'

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 1,
    centerId: 5,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '+998977522014',
    experience: '3 yil, 21-maktab',
    birthYear: 1995,
    subjectId: 2,
    subject: { id: 2, name: 'Matematika' },
    address: 'Toshkent',
    comment: 'Yaxshi nomzod',
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

// UiTable renders a <table> AND mobile cards — scope to tbody so each row counts once.
const cells = (wrapper: ReturnType<typeof mount>) => wrapper.findAll('tbody td').map((td) => td.text())

describe('CandidatesTable', () => {
  it('renders surname-first name, formatted phone, subject and address', () => {
    const wrapper = mount(CandidatesTable, { props: { rows: [makeCandidate()] } })
    const row = cells(wrapper)

    expect(row).toContain('Valiyev Ali')
    expect(row).toContain(formatPhone('+998977522014'))
    expect(row).toContain('1995')
    expect(row).toContain('Matematika')
    expect(row).toContain('Toshkent')
    expect(row).toContain(formatDate('2026-09-01T10:00:00.000Z'))
  })

  it('shows a dash for a missing subject and address', () => {
    const wrapper = mount(CandidatesTable, {
      props: { rows: [makeCandidate({ subject: null, subjectId: null, address: null })] },
    })
    const dashes = cells(wrapper).filter((text) => text === '—')
    expect(dashes).toHaveLength(2)
  })

  it('has no experience or comment column — they are on the candidate page', () => {
    const wrapper = mount(CandidatesTable, { props: { rows: [makeCandidate()] } })
    const head = wrapper.find('thead').text()
    expect(head).not.toContain(t('candidates.detail.experience'))
    expect(head).not.toContain(t('candidates.detail.comment'))
    expect(cells(wrapper)).not.toContain('3 yil, 21-maktab')
    expect(cells(wrapper)).not.toContain('Yaxshi nomzod')
  })

  it('renders the empty text when there are no rows', () => {
    const wrapper = mount(CandidatesTable, { props: { rows: [] } })
    expect(wrapper.text()).toContain(t('candidates.empty'))
  })

  it('opens the row both from the view button and from a row click', async () => {
    const candidate = makeCandidate()
    const wrapper = mount(CandidatesTable, { props: { rows: [candidate] } })
    const buttons = wrapper.findAll('tbody button')
    expect(buttons).toHaveLength(1)

    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('view')).toHaveLength(1) // the button does not also fire the row
    await wrapper.get('tbody tr').trigger('click')
    expect(wrapper.emitted('view')?.[1]).toEqual([candidate])
  })

  it('emits edit and delete with the row when canManage, without opening it', async () => {
    const candidate = makeCandidate()
    const wrapper = mount(CandidatesTable, { props: { rows: [candidate], canManage: true } })
    const buttons = wrapper.findAll('tbody button')
    expect(buttons).toHaveLength(3)

    await buttons[1]!.trigger('click')
    await buttons[2]!.trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([candidate])
    expect(wrapper.emitted('delete')?.[0]).toEqual([candidate])
    expect(wrapper.emitted('view')).toBeUndefined()
  })
})
