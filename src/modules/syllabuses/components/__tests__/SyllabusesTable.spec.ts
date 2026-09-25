import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import SyllabusesTable from '../SyllabusesTable.vue'
import type { SyllabusListItem } from '../../interfaces/syllabus.interface'

vi.mock('vue-router', () => ({
  RouterLink: {
    name: 'RouterLink',
    props: ['to'],
    template: '<a :href="to"><slot /></a>',
  },
}))

const rows: SyllabusListItem[] = [
  {
    id: 42,
    name: 'JavaScript asoslari',
    description: null,
    subject: { id: 2, name: 'Programming' },
    topicsCount: 7,
    createdAt: '2026-01-15',
  },
]

function mountTable(props: Record<string, unknown> = {}) {
  return mount(SyllabusesTable, { props: { rows, ...props } })
}

describe('SyllabusesTable', () => {
  it('links the name to the detail route', () => {
    const wrapper = mountTable()
    const link = wrapper.find('a[href="/syllabuses/42"]')
    expect(link.exists()).toBe(true)
    expect(link.text()).toContain('JavaScript asoslari')
  })

  it('renders the topics count in a badge', () => {
    const wrapper = mountTable()
    const badge = wrapper.findComponent({ name: 'UiBadge' })
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('7')
  })

  it('shows a delete button and emits delete only when canManage is true', async () => {
    const managed = mountTable({ canManage: true })
    const btn = managed.find('button')
    expect(btn.exists()).toBe(true)

    await btn.trigger('click')
    expect(managed.emitted('delete')?.[0]).toEqual([rows[0]])
  })

  it('hides the delete button when canManage is false', () => {
    const readonly = mountTable({ canManage: false })
    expect(readonly.find('button').exists()).toBe(false)
  })
})
