import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UsersTable from '../UsersTable.vue'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ROLE_LABEL_KEYS } from '../../config/role-labels'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import type { User } from '../../interfaces/user.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const last = (events: unknown[][] | undefined) =>
  events ? events[events.length - 1] : undefined

const columns: TableColumn[] = [
  { key: 'firstName', label: 'Ism' },
  { key: 'role', label: 'Rol' },
  { key: 'salary', label: 'Oylik' },
  { key: 'commissionPercentage', label: 'Ustama' },
  { key: 'center', label: 'Markaz' },
]

const rows: User[] = [
  {
    id: 1, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '1',
    role: UserRole.TEACHER, centerId: 2, salary: 2000000, commissionPercentage: 40,
    center: { id: 2, name: 'Chilonzor' },
  },
  {
    id: 2, firstName: 'Vali', lastName: 'Aliyev', login: 'vali', phone: '2',
    role: UserRole.MANAGER, centerId: 2, salary: null, commissionPercentage: null,
  },
]

const rowsWithDynamicRole: User[] = [
  {
    id: 3, firstName: 'Malika', lastName: 'Tosh', login: 'malika', phone: '3',
    role: UserRole.OTHER, centerId: 2, salary: null, commissionPercentage: null,
    userRole: { id: 9, name: 'Kassir', baseRole: UserRole.OTHER },
  },
  {
    id: 4, firstName: 'Nodir', lastName: 'Qori', login: 'nodir', phone: '4',
    role: UserRole.TEACHER, centerId: 2, salary: null, commissionPercentage: null,
  },
]

const EDIT_BTN = 'button.hover\\:text-primary'
const DELETE_BTN = 'button.hover\\:text-danger'

function mountTable() {
  return mount(UsersTable, { props: { columns, rows, canEdit: true, canDelete: true } })
}

describe('UsersTable', () => {
  it('renders the translated role label', () => {
    const text = mountTable().text()
    expect(text).toContain(t(ROLE_LABEL_KEYS[UserRole.TEACHER]))
    expect(text).toContain(t(ROLE_LABEL_KEYS[UserRole.MANAGER]))
  })

  it('renders salary as formatted money in a font-mono cell (— when null)', () => {
    const monoCells = mountTable().findAll('tbody span.font-mono')
    expect(monoCells).toHaveLength(2)
    expect(monoCells[0]!.text()).toBe(formatSom(2000000))
    expect(monoCells[1]!.text()).toBe(formatSom(null))
  })

  it('renders commission as {n}% or — when null', () => {
    const text = mountTable().text()
    expect(text).toContain('40%')
    expect(text).toContain('—')
  })

  it('renders the center name', () => {
    expect(mountTable().text()).toContain('Chilonzor')
  })

  it('emits edit with the row', async () => {
    const wrapper = mountTable()
    await wrapper.findAll(EDIT_BTN)[0]!.trigger('click')
    expect(last(wrapper.emitted('edit'))).toEqual([rows[0]])
  })

  it('emits delete with the row', async () => {
    const wrapper = mountTable()
    await wrapper.findAll(DELETE_BTN)[0]!.trigger('click')
    expect(last(wrapper.emitted('delete'))).toEqual([rows[0]])
  })

  describe('role cell — dynamic role vs base-role fallback', () => {
    function mountDynamicTable() {
      return mount(UsersTable, {
        props: { columns, rows: rowsWithDynamicRole, canEdit: true, canDelete: true },
      })
    }

    it("shows the assigned dynamic role's own name when userRole is present", () => {
      expect(mountDynamicTable().text()).toContain('Kassir')
    })

    it('falls back to the translated base-role-type label when userRole is absent', () => {
      const text = mountDynamicTable().text()
      expect(text).toContain(t(ROLE_LABEL_KEYS[UserRole.TEACHER]))
    })
  })

  describe('view action', () => {
    it('renders no view button when canView is false/unset', () => {
      const wrapper = mount(UsersTable, { props: { columns, rows, canEdit: true, canDelete: true } })
      expect(wrapper.find('tbody').find(`[aria-label="${t('common.view')}"]`).exists()).toBe(false)
    })

    it('renders a view button per row and emits view with the row when canView is true', async () => {
      const wrapper = mount(UsersTable, {
        props: { columns, rows, canView: true, canEdit: true, canDelete: true },
      })
      const viewButtons = wrapper.get('tbody').findAll(`[aria-label="${t('common.view')}"]`)
      expect(viewButtons).toHaveLength(rows.length)

      await viewButtons[0]!.trigger('click')
      expect(last(wrapper.emitted('view'))).toEqual([rows[0]])
    })
  })
})
