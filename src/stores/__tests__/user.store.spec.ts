import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '../user.store'
import { login as loginApi, fetchMe as fetchMeApi, logout as logoutApi } from '@/modules/auth/api/auth.api'
import { TOKEN_KEY } from '@/shared/api/http'
import { UserRole } from '@/shared/enums/user-role.enum'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'

// The store delegates to the auth api — mock it so no network is hit.
vi.mock('@/modules/auth/api/auth.api', () => ({
  login: vi.fn(),
  fetchMe: vi.fn(),
  logout: vi.fn(),
}))

const mockedLogin = vi.mocked(loginApi)
const mockedFetchMe = vi.mocked(fetchMeApi)
const mockedLogout = vi.mocked(logoutApi)

const user = { id: 1, email: 'a@b.uz', role: UserRole.ADMIN, centerId: 2, roleId: 2, roleName: 'Administrator', permissions: ['*'] }

describe('user store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('login stores the token, sets the user, flips isAuthenticated and returns the user', async () => {
    mockedLogin.mockResolvedValueOnce({ access_token: 'jwt', user })
    const store = useUserStore()

    expect(store.isAuthenticated).toBe(false)

    const result = await store.login({ email: 'a@b.uz', password: 'secret' })

    expect(mockedLogin).toHaveBeenCalledWith({ email: 'a@b.uz', password: 'secret' })
    expect(localStorage.getItem(TOKEN_KEY)).toBe('jwt')
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    expect(result).toEqual(user)
  })

  it('fetchMe sets the user from the response', async () => {
    mockedFetchMe.mockResolvedValueOnce({ user })
    const store = useUserStore()

    const result = await store.fetchMe()

    expect(mockedFetchMe).toHaveBeenCalled()
    expect(store.user).toEqual(user)
    expect(store.isAuthenticated).toBe(true)
    expect(result).toEqual(user)
  })

  it('logout calls the api, clears the token and resets the user to null', async () => {
    mockedLogout.mockResolvedValueOnce(undefined)
    localStorage.setItem(TOKEN_KEY, 'jwt')
    const store = useUserStore()
    store.user = user

    await store.logout()

    expect(mockedLogout).toHaveBeenCalled()
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull()
    expect(store.user).toBeNull()
    expect(store.isAuthenticated).toBe(false)
  })

  describe('can()', () => {
    function signIn(permissions: string[]) {
      const store = useUserStore()
      store.user = { ...user, permissions }
      return store
    }

    it('is false before the user is loaded', () => {
      expect(useUserStore().can(Permission.PAYMENTS_VIEW)).toBe(false)
    })

    it('grants a held key and denies the rest', () => {
      const store = signIn([Permission.PAYMENTS_VIEW])
      expect(store.can(Permission.PAYMENTS_VIEW)).toBe(true)
      expect(store.can(Permission.PAYROLL_VIEW)).toBe(false)
    })

    it('treats several keys as OR', () => {
      const store = signIn([Permission.GROUPS_UPDATE])
      expect(store.can(Permission.GROUPS_CREATE, Permission.GROUPS_UPDATE)).toBe(true)
    })

    it('lets the wildcard satisfy everything', () => {
      const store = signIn([ALL_PERMISSIONS])
      expect(store.can(Permission.PAYROLL_DEDUCT)).toBe(true)
    })

    it('exposes the raw permission list and base role', () => {
      const store = signIn([Permission.LEADS_VIEW])
      expect(store.permissions).toEqual([Permission.LEADS_VIEW])
      expect(store.role).toBe(UserRole.ADMIN)
    })

    it('forgets the permissions on logout', async () => {
      const store = signIn([ALL_PERMISSIONS])
      await store.logout()
      expect(store.permissions).toEqual([])
      expect(store.can(Permission.STUDENTS_VIEW)).toBe(false)
    })
  })
})
