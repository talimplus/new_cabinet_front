import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useScopeStore } from '../scope.store'
import { useUserStore } from '../user.store'
import { fetchAllCenters as fetchAllCentersApi } from '@/modules/centers/api/centers.api'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import type { Center } from '@/modules/centers/interfaces/center.interface'

import type * as CentersApiModule from '@/modules/centers/api/centers.api'

type CentersApi = typeof CentersApiModule

// The store delegates to the centers api — mock it so no network is hit.
vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn<CentersApi['fetchAllCenters']>(),
}))

import type * as AuthApiModule from '@/modules/auth/api/auth.api'

type AuthApi = typeof AuthApiModule

vi.mock('@/modules/auth/api/auth.api', () => ({
  login: vi.fn<AuthApi['login']>(),
  logout: vi.fn<AuthApi['logout']>(),
  register: vi.fn<AuthApi['register']>(),
  fetchMe: vi.fn<AuthApi['fetchMe']>(),
}))

const mockedFetchAll = vi.mocked(fetchAllCentersApi)

const CENTERS: Center[] = [
  { id: 1, name: 'Markaz 1' },
  { id: 2, name: 'Markaz 2', isDefault: true },
  { id: 3, name: 'Markaz 3' },
]

function signIn(role: UserRole, centerId: number | null = 1): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role, roleId: 1, roleName: 'Test',
    centerId, permissions: [ALL_PERMISSIONS],
  }
}

describe('scope store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('starts on "All centers"', () => {
    expect(useScopeStore().activeCenterId).toBeNull()
  })

  it('loadCenters fills the list once signed in', async () => {
    signIn(UserRole.ADMIN)
    mockedFetchAll.mockResolvedValueOnce(CENTERS)
    const store = useScopeStore()

    await store.loadCenters()

    expect(store.centers).toEqual(CENTERS)
    expect(store.loaded).toBe(true)
  })

  it('does not load anything for a signed-out visitor', async () => {
    await useScopeStore().loadCenters()
    expect(mockedFetchAll).not.toHaveBeenCalled()
  })

  it('does not refetch on a second call unless forced', async () => {
    signIn(UserRole.ADMIN)
    mockedFetchAll.mockResolvedValue(CENTERS)
    const store = useScopeStore()

    await store.loadCenters()
    await store.loadCenters()
    expect(mockedFetchAll).toHaveBeenCalledTimes(1)

    await store.loadCenters(true)
    expect(mockedFetchAll).toHaveBeenCalledTimes(2)
  })

  describe('setActive', () => {
    it('persists the choice and clears it for "All centers"', () => {
      signIn(UserRole.ADMIN)
      const store = useScopeStore()

      store.setActive(3)
      expect(store.activeCenterId).toBe(3)
      expect(localStorage.getItem('activeCenterId')).toBe('3')

      store.setActive(null)
      expect(store.activeCenterId).toBeNull()
      expect(localStorage.getItem('activeCenterId')).toBeNull()
    })

    it('falls back to "All centers" when the stored center is gone', async () => {
      localStorage.setItem('activeCenterId', '99')
      signIn(UserRole.ADMIN)
      mockedFetchAll.mockResolvedValueOnce(CENTERS)
      const store = useScopeStore()

      expect(store.activeCenterId).toBe(99)
      await store.loadCenters()
      expect(store.activeCenterId).toBeNull()
    })
  })

  describe('canSwitch', () => {
    it('is true for the owner roles', () => {
      signIn(UserRole.ADMIN)
      expect(useScopeStore().canSwitch).toBe(true)
    })

    it('is false for everyone else', () => {
      signIn(UserRole.RECEPTION)
      expect(useScopeStore().canSwitch).toBe(false)
    })
  })

  describe('requestCenterId', () => {
    it('is undefined on "All centers" — no filter is sent', () => {
      signIn(UserRole.ADMIN)
      expect(useScopeStore().requestCenterId).toBeUndefined()
    })

    it('is the active center once one is picked', () => {
      signIn(UserRole.ADMIN)
      const store = useScopeStore()
      store.setActive(2)
      expect(store.requestCenterId).toBe(2)
    })

    it('stays undefined for a user who cannot switch (the backend pins them)', () => {
      signIn(UserRole.TEACHER, 7)
      const store = useScopeStore()
      store.setActive(2)
      expect(store.requestCenterId).toBeUndefined()
    })
  })

  describe('centerIdForCreate', () => {
    it('is the active center when one is picked', async () => {
      signIn(UserRole.ADMIN)
      mockedFetchAll.mockResolvedValueOnce(CENTERS)
      const store = useScopeStore()
      await store.loadCenters()

      store.setActive(3)
      expect(store.centerIdForCreate).toBe(3)
    })

    it('falls back to the default center on "All centers"', async () => {
      signIn(UserRole.ADMIN)
      mockedFetchAll.mockResolvedValueOnce(CENTERS)
      const store = useScopeStore()
      await store.loadCenters()

      expect(store.activeCenterId).toBeNull()
      expect(store.centerIdForCreate).toBe(2) // the isDefault one
    })

    it("is the user's own center when they cannot switch", async () => {
      signIn(UserRole.RECEPTION, 3)
      mockedFetchAll.mockResolvedValueOnce(CENTERS)
      const store = useScopeStore()
      await store.loadCenters()

      expect(store.centerIdForCreate).toBe(3)
    })
  })

  it('ownCenter resolves the signed-in user\'s center', async () => {
    signIn(UserRole.TEACHER, 3)
    mockedFetchAll.mockResolvedValueOnce(CENTERS)
    const store = useScopeStore()
    await store.loadCenters()

    expect(store.ownCenter?.name).toBe('Markaz 3')
  })

  it('reset clears everything on logout', async () => {
    signIn(UserRole.ADMIN)
    mockedFetchAll.mockResolvedValueOnce(CENTERS)
    const store = useScopeStore()
    await store.loadCenters()
    store.setActive(2)

    store.reset()

    expect(store.centers).toEqual([])
    expect(store.loaded).toBe(false)
    expect(store.activeCenterId).toBeNull()
  })
})
