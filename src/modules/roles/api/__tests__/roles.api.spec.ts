import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import {
  fetchRoles, fetchPermissionCatalog, createRole, updateRole, deleteRole,
} from '../roles.api'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Role } from '../../interfaces/role.interface'
import type { PermissionGroup } from '../../interfaces/permission-group.interface'

import type { AxiosInstance } from 'axios'

type Http = AxiosInstance

vi.mock('@/shared/api/http', () => ({
  http: {
    get: vi.fn<Http['get']>(),
    post: vi.fn<Http['post']>(),
    put: vi.fn<Http['put']>(),
    delete: vi.fn<Http['delete']>(),
  },
}))

const mockedHttp = vi.mocked(http, true)

const role: Role = {
  id: 8, key: 'reception', name: 'Qabulxona', baseRole: UserRole.RECEPTION,
  permissions: ['students.view'], isSystem: true, isLocked: false, userCount: 2,
  createdAt: '2026-09-20T18:33:20.340Z', updatedAt: '2026-09-20T18:33:20.340Z',
}

const group: PermissionGroup = {
  key: 'dashboard',
  label: { uz: 'Statistika', ru: 'Статистика' },
  permissions: [{ key: 'statistics.view', label: { uz: 'Ko‘rish', ru: 'Просмотр' } }],
}

describe('roles.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchRoles returns the bare array body', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [role] })
    await expect(fetchRoles()).resolves.toEqual([role])
    expect(mockedHttp.get).toHaveBeenCalledWith('/roles')
  })

  it('fetchPermissionCatalog returns the bare array body', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: [group] })
    await expect(fetchPermissionCatalog()).resolves.toEqual([group])
    expect(mockedHttp.get).toHaveBeenCalledWith('/roles/permissions')
  })

  it('createRole posts the form and returns the created role', async () => {
    const form = { name: 'Kassir', baseRole: UserRole.OTHER, permissions: ['payments.view'] }
    mockedHttp.post.mockResolvedValueOnce({ data: role })

    await expect(createRole(form)).resolves.toEqual(role)
    expect(mockedHttp.post).toHaveBeenCalledWith('/roles', form)
  })

  it('updateRole puts a partial body by id', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: role })
    await updateRole(8, { name: 'Bosh kassir' })
    expect(mockedHttp.put).toHaveBeenCalledWith('/roles/8', { name: 'Bosh kassir' })
  })

  it('deleteRole calls the id endpoint', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })
    await deleteRole(8)
    expect(mockedHttp.delete).toHaveBeenCalledWith('/roles/8')
  })
})
