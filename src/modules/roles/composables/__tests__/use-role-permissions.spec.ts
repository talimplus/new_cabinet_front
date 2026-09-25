import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import { useRolePermissions } from '../use-role-permissions'
import type { PermissionGroup } from '../../interfaces/permission-group.interface'

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

function setup(initial: string[] = []) {
  const selected = ref<string[]>(initial)
  return { selected, ...useRolePermissions(selected, ref(CATALOG)) }
}

describe('useRolePermissions', () => {
  it('counts the selected keys of a group', () => {
    const s = setup(['students.view', 'payments.view'])
    expect(s.selectedInGroup(CATALOG[0]!)).toBe(1)
    expect(s.selectedInGroup(CATALOG[1]!)).toBe(1)
  })

  it('reports a fully ticked group', () => {
    const s = setup(['students.view', 'students.create'])
    expect(s.isGroupFull(CATALOG[0]!)).toBe(true)
    expect(s.isGroupPartial(CATALOG[0]!)).toBe(false)
  })

  it('reports a partially ticked group', () => {
    const s = setup(['students.view'])
    expect(s.isGroupFull(CATALOG[0]!)).toBe(false)
    expect(s.isGroupPartial(CATALOG[0]!)).toBe(true)
  })

  it('reports an empty group as neither full nor partial', () => {
    const s = setup([])
    expect(s.isGroupFull(CATALOG[0]!)).toBe(false)
    expect(s.isGroupPartial(CATALOG[0]!)).toBe(false)
  })

  it('toggling a group on adds every key without duplicating', () => {
    const s = setup(['students.view'])
    s.toggleGroup(CATALOG[0]!, true)
    expect(s.selected.value).toEqual(['students.view', 'students.create'])
  })

  it('toggling a group off removes only that group', () => {
    const s = setup(['students.view', 'students.create', 'payments.view'])
    s.toggleGroup(CATALOG[0]!, false)
    expect(s.selected.value).toEqual(['payments.view'])
  })

  it('toggles a single permission both ways', () => {
    const s = setup([])
    s.togglePermission('payments.view', true)
    expect(s.selected.value).toEqual(['payments.view'])
    s.togglePermission('payments.view', false)
    expect(s.selected.value).toEqual([])
  })

  it('selectAll picks every key in the catalog', () => {
    const s = setup([])
    s.selectAll()
    expect(s.selected.value).toEqual(['students.view', 'students.create', 'payments.view'])
  })

  it('clearAll empties the selection', () => {
    const s = setup(['students.view'])
    s.clearAll()
    expect(s.selected.value).toEqual([])
  })

  it('totalKeys counts the whole catalog', () => {
    expect(setup().totalKeys.value).toBe(3)
  })
})
