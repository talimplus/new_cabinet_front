import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { createRouter, createMemoryHistory, type Router } from 'vue-router'
import { h } from 'vue'
import { registerGuards } from '../guards'
import { useUserStore } from '@/stores/user.store'
import { TOKEN_KEY } from '@/shared/api/http'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'

import type * as AuthApiModule from '@/modules/auth/api/auth.api'

type AuthApi = typeof AuthApiModule

vi.mock('@/modules/auth/api/auth.api', () => ({
  login: vi.fn<AuthApi['login']>(),
  logout: vi.fn<AuthApi['logout']>(),
  register: vi.fn<AuthApi['register']>(),
  fetchMe: vi.fn<AuthApi['fetchMe']>(),
}))

const Blank = { render: () => h('div') }

function makeRouter(): Router {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: Blank, meta: { guestOnly: true } },
      { path: '/profile', name: 'profile', component: Blank, meta: { requiresAuth: true } },
      {
        path: '/',
        name: 'dashboard',
        component: Blank,
        meta: { requiresAuth: true, permission: [Permission.STATISTICS_VIEW] },
      },
      {
        path: '/payments',
        name: 'payments',
        component: Blank,
        meta: { requiresAuth: true, permission: [Permission.PAYMENTS_VIEW] },
      },
      {
        path: '/groups',
        name: 'groups',
        component: Blank,
        meta: { requiresAuth: true, permission: [Permission.GROUPS_VIEW] },
      },
    ],
  })
  registerGuards(router)
  return router
}

function signIn(permissions: string[]): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role: UserRole.ADMIN, roleId: 1,
    roleName: 'Test', centerId: 1, permissions,
  }
}

describe('router guards', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('bounces an unauthenticated visitor to /login', async () => {
    const router = makeRouter()
    await router.push('/payments')
    expect(router.currentRoute.value.path).toBe('/login')
  })

  it('lets a permitted user through', async () => {
    const router = makeRouter()
    signIn([Permission.PAYMENTS_VIEW])
    await router.push('/payments')
    expect(router.currentRoute.value.path).toBe('/payments')
  })

  it('redirects to the resolved home instead of showing a 403', async () => {
    const router = makeRouter()
    signIn([Permission.GROUPS_VIEW])
    await router.push('/payments')
    expect(router.currentRoute.value.path).toBe('/groups')
  })

  it('sends a permission-less user to the ungated profile page', async () => {
    const router = makeRouter()
    signIn([])
    await router.push('/payments')
    expect(router.currentRoute.value.path).toBe('/profile')
  })

  it('keeps a signed-in user away from the login page', async () => {
    const router = makeRouter()
    signIn([ALL_PERMISSIONS])
    await router.push('/login')
    expect(router.currentRoute.value.path).toBe('/')
  })

  it('opens a route that carries no permission', async () => {
    const router = makeRouter()
    signIn([])
    await router.push('/profile')
    expect(router.currentRoute.value.path).toBe('/profile')
  })

  it('rehydrates the session from a stored token', async () => {
    const { fetchMe } = await import('@/modules/auth/api/auth.api')
    vi.mocked(fetchMe).mockResolvedValueOnce({
      user: {
        id: 9, email: 'x@y.uz', role: UserRole.MANAGER, roleId: 3,
        roleName: 'Menejer', centerId: 2, permissions: [Permission.PAYMENTS_VIEW],
      },
    })
    localStorage.setItem(TOKEN_KEY, 'jwt')

    const router = makeRouter()
    await router.push('/payments')

    expect(fetchMe).toHaveBeenCalled()
    expect(router.currentRoute.value.path).toBe('/payments')
  })

  it('drops a stale token when /auth/me fails', async () => {
    const { fetchMe } = await import('@/modules/auth/api/auth.api')
    vi.mocked(fetchMe).mockRejectedValueOnce(new Error('401'))
    localStorage.setItem(TOKEN_KEY, 'expired')

    const router = makeRouter()
    await router.push('/payments')

    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(router.currentRoute.value.path).toBe('/login')
  })
})
