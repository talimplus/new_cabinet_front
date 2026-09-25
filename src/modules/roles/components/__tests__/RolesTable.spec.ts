import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RolesTable from '../RolesTable.vue'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { t } from '@/locales'
import type { Role } from '../../interfaces/role.interface'

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 8, key: 'kassir', name: 'Kassir', baseRole: UserRole.OTHER,
    permissions: ['payments.view', 'payments.create'],
    isSystem: false, isLocked: false, userCount: 3,
    createdAt: '', updatedAt: '',
    ...overrides,
  }
}

function mountTable(rows: Role[], canManage = true) {
  return mount(RolesTable, { props: { rows, canManage } })
}

// UiTable renders each row twice (desktop table + mobile card), so element
// counts are scoped to `tbody` — the desktop rendering.
describe('RolesTable', () => {
  it('renders the name, base role, key count and user count', () => {
    const text = mountTable([makeRole()]).text()
    expect(text).toContain('Kassir')
    expect(text).toContain(t('roles.baseRoles.other'))
    expect(text).toContain(t('roles.permissionCount', { count: 2 }))
    expect(text).toContain('3')
  })

  it('shows "all permissions" for the wildcard instead of a count', () => {
    const text = mountTable([makeRole({ permissions: [ALL_PERMISSIONS] })]).text()
    expect(text).toContain(t('roles.allPermissions'))
    expect(text).not.toContain(t('roles.permissionCount', { count: 1 }))
  })

  it('badges a locked role and a system role differently', () => {
    expect(mountTable([makeRole({ isLocked: true, isSystem: true })]).text())
      .toContain(t('roles.badges.locked'))
    expect(mountTable([makeRole({ isSystem: true })]).text())
      .toContain(t('roles.badges.system'))
  })

  it('offers edit + delete for a custom role', () => {
    const wrapper = mountTable([makeRole()])
    expect(wrapper.findAll('tbody button')).toHaveLength(2)
  })

  it('hides delete for a system role and both actions for a locked one', () => {
    expect(mountTable([makeRole({ isSystem: true })]).findAll('tbody button')).toHaveLength(1)
    expect(mountTable([makeRole({ isLocked: true })]).findAll('tbody button')).toHaveLength(0)
  })

  it('hides every action without roles.manage', () => {
    expect(mountTable([makeRole()], false).findAll('tbody button')).toHaveLength(0)
  })

  it('emits edit and delete with the row', async () => {
    const wrapper = mountTable([makeRole({ id: 12 })])
    const buttons = wrapper.findAll('tbody button')
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('edit')?.[0]?.[0]).toMatchObject({ id: 12 })
    expect(wrapper.emitted('delete')?.[0]?.[0]).toMatchObject({ id: 12 })
  })

  it('shows the empty text when there are no roles', () => {
    expect(mountTable([]).text()).toContain(t('roles.empty'))
  })
})
