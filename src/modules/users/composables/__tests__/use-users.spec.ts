import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useUsers } from '../use-users'
import {
  fetchUsers as fetchUsersApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  setUserActive as setUserActiveApi,
} from '../../api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { User } from '../../interfaces/user.interface'
import type { UserForm } from '../../interfaces/user-form.interface'
import { t } from '@/locales'

vi.mock('../../api/users.api', () => ({
  fetchUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  setUserActive: vi.fn(),
}))

const mockedFetchUsers = vi.mocked(fetchUsersApi)
const mockedCreateUser = vi.mocked(createUserApi)
const mockedUpdateUser = vi.mocked(updateUserApi)
const mockedDeleteUser = vi.mocked(deleteUserApi)
const mockedSetUserActive = vi.mocked(setUserActiveApi)

const CENTER_ID = 5

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 1, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998901112233',
    role: UserRole.TEACHER, centerId: CENTER_ID, salary: 2000000, commissionPercentage: 40,
    ...overrides,
  }
}
const form: UserForm = {
  firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998901112233',
  password: 'secret', roleId: 11, centerId: CENTER_ID,
}

describe('useUsers', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchUsers.mockResolvedValue({
      data: [makeUser()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 3 },
    })
  })

  describe('load()', () => {

    it('builds params from the filters and strips empty ones', async () => {
      const s = useUsers()
      s.applyFilters()
      await flushPromises()

      expect(mockedFetchUsers).toHaveBeenCalledWith({
        name: undefined, phone: undefined, page: 1, perPage: 10,
      })
      expect(s.rows.value).toHaveLength(1)
      expect(s.totalPages.value).toBe(3)
    })

    it('passes non-empty name/phone filters through', async () => {
      const s = useUsers()
      s.search('ali')
      await flushPromises()
      s.searchPhone('998')
      await flushPromises()

      expect(mockedFetchUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ name: 'ali', phone: '998', page: 1 }),
      )
    })
  })

  describe('submit()', () => {
    it('creates when not editing, then notifies and closes the modal', async () => {
      const s = useUsers()
      s.openCreate()
      mockedCreateUser.mockResolvedValueOnce(makeUser({ id: 99 }))

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateUser).toHaveBeenCalledWith(form)
      expect(mockedUpdateUser).not.toHaveBeenCalled()
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing user by id', async () => {
      const s = useUsers()
      const editing = makeUser({ id: 42 })
      s.openEdit(editing)
      mockedUpdateUser.mockResolvedValueOnce(editing)

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateUser).not.toHaveBeenCalled()
      expect(mockedUpdateUser).toHaveBeenCalledWith(42, form)
    })
  })

  describe('delete flow', () => {
    it('requestDelete stores the target without calling the api', () => {
      const s = useUsers()
      const target = makeUser({ id: 7 })
      s.requestDelete(target)
      expect(s.deleteTarget.value).toEqual(target)
      expect(mockedDeleteUser).not.toHaveBeenCalled()
    })

    it('confirmDelete deletes the target, notifies and clears it', async () => {
      const s = useUsers()
      mockedDeleteUser.mockResolvedValueOnce(undefined)
      s.requestDelete(makeUser({ id: 7 }))

      await s.confirmDelete()
      await flushPromises()

      expect(mockedDeleteUser).toHaveBeenCalledWith(7)
      expect(s.deleteTarget.value).toBeNull()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('confirmDelete is a no-op when there is no target', async () => {
      const s = useUsers()
      await s.confirmDelete()
      expect(mockedDeleteUser).not.toHaveBeenCalled()
    })
  })
  describe('requestToggleActive() + confirmToggleActive()', () => {
    it('blocks an active user, notifies and reloads', async () => {
      const s = useUsers()
      mockedSetUserActive.mockResolvedValueOnce(makeUser({ id: 7, isActive: false }))

      s.requestToggleActive(makeUser({ id: 7, isActive: true }))
      await s.confirmToggleActive()
      await flushPromises()

      expect(mockedSetUserActive).toHaveBeenCalledWith(7, { isActive: false })
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({ type: NotificationType.SUCCESS, message: t('users.messages.blocked') }),
      )
      expect(mockedFetchUsers).toHaveBeenCalledTimes(1)
    })

    it('treats a user without isActive as active (blocks it)', async () => {
      const s = useUsers()
      mockedSetUserActive.mockResolvedValueOnce(makeUser({ id: 7, isActive: false }))

      s.requestToggleActive(makeUser({ id: 7 }))
      await s.confirmToggleActive()

      expect(mockedSetUserActive).toHaveBeenCalledWith(7, { isActive: false })
    })

    it('unblocks a blocked user, notifies and reloads', async () => {
      const s = useUsers()
      mockedSetUserActive.mockResolvedValueOnce(makeUser({ id: 8, isActive: true }))

      s.requestToggleActive(makeUser({ id: 8, isActive: false }))
      await s.confirmToggleActive()
      await flushPromises()

      expect(mockedSetUserActive).toHaveBeenCalledWith(8, { isActive: true })
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({ type: NotificationType.SUCCESS, message: t('users.messages.unblocked') }),
      )
      expect(mockedFetchUsers).toHaveBeenCalledTimes(1)
    })

    it('requesting only opens the confirmation; nothing is sent yet', () => {
      const s = useUsers()
      const u = makeUser({ id: 9 })
      s.requestToggleActive(u)
      expect(s.toggleTarget.value).toEqual(u)
      expect(mockedSetUserActive).not.toHaveBeenCalled()
    })

    it('closes the confirmation after success and ignores a double confirm', async () => {
      const s = useUsers()
      let resolve!: (v: unknown) => void
      mockedSetUserActive.mockReturnValueOnce(new Promise((r) => { resolve = r }) as never)
      s.requestToggleActive(makeUser({ id: 9 }))
      const first = s.confirmToggleActive()
      void s.confirmToggleActive()
      resolve(makeUser({ id: 9, isActive: false }))
      await first
      expect(mockedSetUserActive).toHaveBeenCalledTimes(1)
      expect(s.toggleTarget.value).toBeNull()
    })
  })

  describe('columns', () => {
    it('exposes the 8 table columns with firstName as the primary one', () => {
      const s = useUsers()
      const cols = s.columns.value

      expect(cols.map((c) => c.key)).toEqual([
        'id', 'firstName', 'lastName', 'phone', 'role', 'salary', 'commissionPercentage', 'center',
      ])
      expect(cols.filter((c) => c.primary).map((c) => c.key)).toEqual(['firstName'])
      expect(cols.find((c) => c.key === 'firstName')?.label).toBe(t('users.table.firstName'))
    })
  })
})
