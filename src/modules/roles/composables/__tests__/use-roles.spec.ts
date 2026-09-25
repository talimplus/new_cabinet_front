import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useRoles } from '../use-roles'
import {
  fetchRoles as fetchRolesApi,
  fetchPermissionCatalog as fetchCatalogApi,
  createRole as createRoleApi,
  updateRole as updateRoleApi,
  deleteRole as deleteRoleApi,
} from '../../api/roles.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Role } from '../../interfaces/role.interface'
import type { RoleForm } from '../../interfaces/role-form.interface'

import type * as RolesApiModule from '../../api/roles.api'

type RolesApi = typeof RolesApiModule

vi.mock('../../api/roles.api', () => ({
  fetchRoles: vi.fn<RolesApi['fetchRoles']>(),
  fetchPermissionCatalog: vi.fn<RolesApi['fetchPermissionCatalog']>(),
  createRole: vi.fn<RolesApi['createRole']>(),
  updateRole: vi.fn<RolesApi['updateRole']>(),
  deleteRole: vi.fn<RolesApi['deleteRole']>(),
}))

const mockedFetchRoles = vi.mocked(fetchRolesApi)
const mockedFetchCatalog = vi.mocked(fetchCatalogApi)
const mockedCreate = vi.mocked(createRoleApi)
const mockedUpdate = vi.mocked(updateRoleApi)
const mockedDelete = vi.mocked(deleteRoleApi)

function makeRole(overrides: Partial<Role> = {}): Role {
  return {
    id: 8, key: 'kassir', name: 'Kassir', baseRole: UserRole.OTHER,
    permissions: ['payments.view'], isSystem: false, isLocked: false, userCount: 0,
    createdAt: '2026-09-20T00:00:00.000Z', updatedAt: '2026-09-20T00:00:00.000Z',
    ...overrides,
  }
}

const form: RoleForm = {
  name: 'Kassir', baseRole: UserRole.OTHER, permissions: ['payments.view'],
}

describe('useRoles', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchRoles.mockResolvedValue([makeRole()])
    mockedFetchCatalog.mockResolvedValue([])
  })

  it('load fetches the roles and the catalog together', async () => {
    const r = useRoles()
    await r.load()

    expect(mockedFetchRoles).toHaveBeenCalled()
    expect(mockedFetchCatalog).toHaveBeenCalled()
    expect(r.roles.value).toHaveLength(1)
    expect(r.loading.value).toBe(false)
  })

  it('submit creates when not editing', async () => {
    const r = useRoles()
    r.openCreate()
    mockedCreate.mockResolvedValueOnce(makeRole())

    await r.submit(form)
    await flushPromises()

    expect(mockedCreate).toHaveBeenCalledWith(form)
    expect(mockedUpdate).not.toHaveBeenCalled()
    expect(r.formOpen.value).toBe(false)
    const notify = useNotificationStore()
    expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })

  it('submit updates the editing role and sends its baseRole', async () => {
    const r = useRoles()
    r.openEdit(makeRole({ id: 42 }))
    mockedUpdate.mockResolvedValueOnce(makeRole({ id: 42 }))

    await r.submit(form)

    expect(mockedUpdate).toHaveBeenCalledWith(42, {
      name: form.name, permissions: form.permissions, baseRole: form.baseRole,
    })
  })

  it('omits baseRole for a system role — the backend refuses to change it', async () => {
    const r = useRoles()
    r.openEdit(makeRole({ id: 11, isSystem: true, baseRole: UserRole.TEACHER }))
    mockedUpdate.mockResolvedValueOnce(makeRole({ id: 11 }))

    await r.submit(form)

    expect(mockedUpdate).toHaveBeenCalledWith(11, {
      name: form.name, permissions: form.permissions,
    })
  })

  it('requestDelete stores the target without calling the api', () => {
    const r = useRoles()
    const target = makeRole({ id: 7 })
    r.requestDelete(target)
    expect(r.deleteTarget.value).toEqual(target)
    expect(mockedDelete).not.toHaveBeenCalled()
  })

  it('confirmDelete deletes, notifies, clears the target and reloads', async () => {
    const r = useRoles()
    mockedDelete.mockResolvedValueOnce(undefined)
    r.requestDelete(makeRole({ id: 7 }))

    await r.confirmDelete()
    await flushPromises()

    expect(mockedDelete).toHaveBeenCalledWith(7)
    expect(r.deleteTarget.value).toBeNull()
    expect(mockedFetchRoles).toHaveBeenCalled()
  })

  it('confirmDelete is a no-op without a target', async () => {
    await useRoles().confirmDelete()
    expect(mockedDelete).not.toHaveBeenCalled()
  })
})
