import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LeadsTable from '../LeadsTable.vue'
import { t } from '@/locales'
import type { Lead } from '../../interfaces/lead.interface'

const longComment =
  "Ota-onasi bilan gaplashildi.\nSentyabrdan ingliz tiliga yozilmoqchi, kechki guruh so'radi — narxni yana bir bor aytish kerak."

const lead = (over: Partial<Lead> = {}): Lead => ({ id: 1, firstName: 'Ali', lastName: 'Valiyev', phone: '+998977522014', ...over })

describe('LeadsTable', () => {
  it('has a comment column', () => {
    const wrapper = mount(LeadsTable, { props: { rows: [lead()] } })
    expect(wrapper.find('thead').text()).toContain(t('leads.table.comment'))
  })

  it('renders the whole comment, line breaks kept, not truncated', () => {
    const wrapper = mount(LeadsTable, { props: { rows: [lead({ comment: longComment })] } })
    const p = wrapper.find('tbody p')
    expect(p.element.textContent).toBe(longComment)
    expect(p.classes()).toContain('whitespace-pre-line')
    expect(p.classes()).not.toContain('truncate')
  })

  it('shows a dash when there is no comment', () => {
    const wrapper = mount(LeadsTable, { props: { rows: [lead({ comment: null })] } })
    expect(wrapper.findAll('tbody td').map((td) => td.text())).toContain('—')
  })
})
