import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import MockAdapter from 'axios-mock-adapter'
import { http, TOKEN_KEY } from '../http'
import { useUserStore } from '@/stores/user.store'
import { useScopeStore } from '@/stores/scope.store'
import { isPermissionDeniedError } from '@/shared/permissions/permission-denied-error'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'

import type * as AuthApiModule from '@/modules/auth/api/auth.api'

type AuthApi = typeof AuthApiModule

vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn<() => Promise<never[]>>(),
}))

vi.mock('@/modules/auth/api/auth.api', () => ({
  login: vi.fn<AuthApi['login']>(),
  logout: vi.fn<AuthApi['logout']>(),
  register: vi.fn<AuthApi['register']>(),
  fetchMe: vi.fn<AuthApi['fetchMe']>(),
}))

const mock = new MockAdapter(http)

function signIn(permissions: string[]): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role: UserRole.ADMIN, roleId: 1,
    roleName: 'Test', centerId: 1, permissions,
  }
}

describe('http permission pre-check', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mock.reset()
  })

  it('sends a request the user has the key for', async () => {
    signIn([Permission.PAYMENTS_VIEW])
    mock.onGet('/payments').reply(200, { data: [] })

    const { status } = await http.get('/payments')
    expect(status).toBe(200)
    expect(mock.history.get).toHaveLength(1)
  })

  it('never fires a request the user has no key for', async () => {
    signIn([Permission.GROUPS_VIEW])
    mock.onGet('/payments').reply(200, { data: [] })

    await expect(http.get('/payments')).rejects.toSatisfy(isPermissionDeniedError)
    expect(mock.history.get).toHaveLength(0)
  })

  it('lets the wildcard through', async () => {
    signIn([ALL_PERMISSIONS])
    mock.onDelete('/users/5').reply(204)

    await expect(http.delete('/users/5')).resolves.toBeDefined()
  })

  it('never blocks an open endpoint', async () => {
    signIn([])
    mock.onGet('/centers/all').reply(200, [])

    await expect(http.get('/centers/all')).resolves.toBeDefined()
  })

  it('never blocks an unlisted endpoint', async () => {
    signIn([])
    mock.onGet('/something/new').reply(200, {})

    await expect(http.get('/something/new')).resolves.toBeDefined()
  })

  it('does not block while no user is loaded (bootstrap)', async () => {
    mock.onGet('/auth/me').reply(200, { user: null })
    mock.onGet('/payments').reply(200, { data: [] })

    await expect(http.get('/payments')).resolves.toBeDefined()
  })

  it('attaches the bearer token', async () => {
    localStorage.setItem(TOKEN_KEY, 'jwt')
    signIn([ALL_PERMISSIONS])
    mock.onGet('/rooms').reply(200, { data: [] })

    await http.get('/rooms')
    expect(mock.history.get[0]?.headers?.Authorization).toBe('Bearer jwt')
  })
})

describe('http center scope', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    mock.reset()
  })

  function signInAdmin(): void {
    useUserStore().user = {
      id: 1, email: 'a@b.uz', role: UserRole.ADMIN, roleId: 1,
      roleName: 'Admin', centerId: 1, permissions: [ALL_PERMISSIONS],
    }
  }

  it('appends the active center on an endpoint that accepts it', async () => {
    signInAdmin()
    useScopeStore().setActive(4)
    mock.onGet('/payments').reply(200, { data: [] })

    await http.get('/payments')
    expect(mock.history.get[0]?.params).toMatchObject({ centerId: 4 })
  })

  it('sends no centerId on "All centers"', async () => {
    signInAdmin()
    useScopeStore().setActive(null)
    mock.onGet('/payments').reply(200, { data: [] })

    await http.get('/payments')
    expect(mock.history.get[0]?.params?.centerId).toBeUndefined()
  })

  it('never touches an endpoint that does not accept centerId', async () => {
    signInAdmin()
    useScopeStore().setActive(4)
    mock.onGet('/groups/9').reply(200, {})

    await http.get('/groups/9')
    expect(mock.history.get[0]?.params?.centerId).toBeUndefined()
  })

  it('leaves an explicitly passed centerId alone', async () => {
    signInAdmin()
    useScopeStore().setActive(4)
    mock.onGet('/rooms').reply(200, { data: [] })

    await http.get('/rooms', { params: { centerId: 12 } })
    expect(mock.history.get[0]?.params).toMatchObject({ centerId: 12 })
  })

  it('sends nothing for a user who cannot switch centers', async () => {
    useUserStore().user = {
      id: 2, email: 'r@b.uz', role: UserRole.RECEPTION, roleId: 8,
      roleName: 'Qabulxona', centerId: 3, permissions: [ALL_PERMISSIONS],
    }
    useScopeStore().setActive(4)
    mock.onGet('/students').reply(200, { data: [] })

    await http.get('/students')
    expect(mock.history.get[0]?.params?.centerId).toBeUndefined()
  })
})
