import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'

import RolePermissionCatalog from '../RolePermissionCatalog.vue'
import { setLocale } from '@/locales'
import { AppLocale } from '@/shared/enums/app-locale.enum'
import type { PermissionGroup } from '../../interfaces/permission-group.interface'

/** The most recent payload of an emitted event (`.at()` needs a newer lib). */
function lastEmit(events: unknown[][] | undefined): unknown[] | undefined {
  return events?.[events.length - 1]
}

const CATALOG: PermissionGroup[] = [
  {
    key: 'students',
    label: { uz: 'O‘quvchilar', ru: 'Ученики' },
    permissions: [
      { key: 'students.view', label: { uz: 'Ko‘rish', ru: 'Просмотр' } },
      { key: 'students.create', label: { uz: 'Qo‘shish', ru: 'Добавление' } },
    ],
  },
  {
    key: 'payments',
    label: { uz: 'To‘lovlar', ru: 'Платежи' },
    permissions: [{ key: 'payments.view', label: { uz: 'Ko‘rish', ru: 'Просмотр' } }],
  },
]

function mountCatalog(selected: string[] = []) {
  return mount(RolePermissionCatalog, { props: { catalog: CATALOG, selected } })
}

describe('RolePermissionCatalog', () => {
  it('renders one collapsible panel per group with its backend label', () => {
    const wrapper = mountCatalog()
    const text = wrapper.text()
    expect(text).toContain('O‘quvchilar')
    expect(text).toContain('To‘lovlar')
  })

  it('shows the selected/total counter per group', () => {
    expect(mountCatalog(['students.view']).text()).toContain('1 / 2')
  })

  it('uses the backend Russian label when the app is in Russian', async () => {
    setLocale(AppLocale.RU)
    try {
      expect(mountCatalog().text()).toContain('Ученики')
    } finally {
      setLocale(AppLocale.UZ)
    }
  })

  it('reveals the group keys only once the panel is expanded', async () => {
    const wrapper = mountCatalog()
    expect(wrapper.text()).not.toContain('Qo‘shish')

    await wrapper.findAll('button')[2]!.trigger('click') // first group header
    expect(wrapper.text()).toContain('Qo‘shish')
  })

  it('selectAll ticks every key in the catalog', async () => {
    const wrapper = mountCatalog()
    await wrapper.findAll('button')[0]!.trigger('click')

    expect(wrapper.props('selected')).toEqual([])
    expect(lastEmit(wrapper.emitted('update:selected'))?.[0]).toEqual([
      'students.view', 'students.create', 'payments.view',
    ])
  })

  it('clearAll empties the selection', async () => {
    const wrapper = mountCatalog(['students.view'])
    await wrapper.findAll('button')[1]!.trigger('click')
    expect(lastEmit(wrapper.emitted('update:selected'))?.[0]).toEqual([])
  })

  it('shows how many of all keys are selected', () => {
    expect(mountCatalog(['students.view', 'payments.view']).text()).toContain('(2/3)')
  })

  it('keeps every toggle when two land in the same tick', async () => {
    const wrapper = mountCatalog()
    await wrapper.findAll('button')[3]!.trigger('click') // expand "payments"

    const boxes = wrapper.findAll('input[type="checkbox"]')
    // Tick the group's single key twice over — the second write must see the first.
    const students = mountCatalog()
    await students.findAll('button')[2]!.trigger('click') // expand "students"
    const studentBoxes = students.findAll('input[type="checkbox"]')

    // index 0 is the "select whole group" box; 1 and 2 are the two keys.
    studentBoxes[1]!.setValue(true)
    studentBoxes[2]!.setValue(true)
    await students.vm.$nextTick()

    expect(lastEmit(students.emitted('update:selected'))?.[0]).toEqual([
      'students.view', 'students.create',
    ])
    expect(boxes.length).toBeGreaterThan(0)
  })
})
