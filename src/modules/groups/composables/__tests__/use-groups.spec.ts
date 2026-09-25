import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useGroups } from '../use-groups'
import {
  fetchGroups as fetchGroupsApi,
  deleteGroup as deleteGroupApi,
  changeGroupStatus as changeGroupStatusApi,
} from '../../api/groups.api'
import { fetchTeachers as fetchTeachersApi } from '@/modules/users/api/users.api'
import { useUserStore } from '@/stores/user.store'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { GroupStatus } from '../../enums/group-status.enum'
import type { Group } from '../../interfaces/group.interface'
import type { Employee } from '@/modules/users/interfaces/employee.interface'

vi.mock('../../api/groups.api', () => ({
  fetchGroups: vi.fn(),
  createGroup: vi.fn(),
  updateGroup: vi.fn(),
  deleteGroup: vi.fn(),
  changeGroupStatus: vi.fn(),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchTeachers: vi.fn(),
}))

const mockedFetchGroups = vi.mocked(fetchGroupsApi)
const mockedDeleteGroup = vi.mocked(deleteGroupApi)
const mockedChangeStatus = vi.mocked(changeGroupStatusApi)
const mockedFetchTeachers = vi.mocked(fetchTeachersApi)

function makeGroup(overrides: Partial<Group> = {}): Group {
  return { id: 1, name: 'A1 guruh', monthlyFee: 400000, ...overrides }
}

function emptyPage() {
  return { data: [] as Group[], meta: { total: 0, page: 1, perPage: 10, totalPages: 1 } }
}

/** Authorization is key-based — specs grant keys, not roles. */
function setup(role: UserRole = UserRole.ADMIN, permissions: string[] = [ALL_PERMISSIONS]) {
  setActivePinia(createPinia())
  const userStore = useUserStore()
  userStore.user = {
    id: 1, email: 'a@b.c', role, roleId: 1, roleName: 'Test', centerId: 1, permissions,
  }
  return useGroups()
}

describe('useGroups', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedFetchGroups.mockResolvedValue(emptyPage())
    mockedFetchTeachers.mockResolvedValue([])
    mockedDeleteGroup.mockResolvedValue(undefined)
    mockedChangeStatus.mockResolvedValue(undefined)
  })

  describe('init()', () => {
    it('loads groups with the default filters', async () => {
      const g = setup()
      await g.init()
      expect(mockedFetchGroups).toHaveBeenCalledWith({ page: 1, perPage: 10, teacherId: undefined })
    })

    it('loads teacher options mapped to {label, value} for a non-teacher with view permission', async () => {
      mockedFetchTeachers.mockResolvedValueOnce([
        { id: 5, firstName: 'Ali', lastName: 'Valiyev' } as Employee,
      ])
      const g = setup(UserRole.ADMIN, [ALL_PERMISSIONS])
      await g.init()
      expect(mockedFetchTeachers).toHaveBeenCalled()
      expect(g.teacherOptions.value).toEqual([{ label: 'Ali Valiyev', value: 5 }])
    })

    it('does not load teacher options for a teacher user', async () => {
      const g = setup(UserRole.TEACHER, [ALL_PERMISSIONS])
      await g.init()
      expect(mockedFetchTeachers).not.toHaveBeenCalled()
      expect(g.teacherOptions.value).toEqual([])
    })
  })

  describe('setTeacher()', () => {
    it('resets the page to 1, stores the teacherId, and reloads', async () => {
      const g = setup()
      await g.init()
      g.filters.page = 3

      g.setTeacher(5)
      await flushPromises()

      expect(g.filters.page).toBe(1)
      expect(g.filters.teacherId).toBe(5)
      expect(mockedFetchGroups).toHaveBeenLastCalledWith({ page: 1, perPage: 10, teacherId: 5 })
    })
  })

  describe('delete flow', () => {
    it('askDelete sets pendingDelete', () => {
      const g = setup()
      const row = makeGroup({ id: 7 })
      g.askDelete(row)
      expect(g.pendingDelete.value).toEqual(row)
    })

    it('confirmDelete deletes, clears pendingDelete, and reloads', async () => {
      const g = setup()
      await g.init()
      const row = makeGroup({ id: 7 })
      g.askDelete(row)

      await g.confirmDelete()

      expect(mockedDeleteGroup).toHaveBeenCalledWith(7)
      expect(g.pendingDelete.value).toBeNull()
      // initial load (init) + reload after delete
      expect(mockedFetchGroups).toHaveBeenCalledTimes(2)
    })
  })

  describe('setStatus() / confirmFinish()', () => {
    it('opens pendingFinish without calling changeGroupStatus when endDate is in the future', () => {
      const g = setup()
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const row = makeGroup({ endDate: future.toISOString().slice(0, 10) })

      g.setStatus(row, GroupStatus.FINISHED)

      expect(g.pendingFinish.value).toEqual(row)
      expect(mockedChangeStatus).not.toHaveBeenCalled()
    })

    it('confirmFinish calls changeGroupStatus(id, FINISHED) and clears pendingFinish', async () => {
      const g = setup()
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const row = makeGroup({ id: 9, endDate: future.toISOString().slice(0, 10) })
      g.setStatus(row, GroupStatus.FINISHED)

      g.confirmFinish()
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(9, GroupStatus.FINISHED)
      expect(g.pendingFinish.value).toBeNull()
    })

    it('calls changeGroupStatus immediately when endDate is in the past', async () => {
      const g = setup()
      const row = makeGroup({ id: 3, endDate: '2020-01-01' })

      g.setStatus(row, GroupStatus.FINISHED)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(3, GroupStatus.FINISHED)
      expect(g.pendingFinish.value).toBeNull()
    })

    it('calls changeGroupStatus immediately when there is no endDate', async () => {
      const g = setup()
      const row = makeGroup({ id: 4, endDate: undefined })

      g.setStatus(row, GroupStatus.FINISHED)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(4, GroupStatus.FINISHED)
    })

    it('a non-FINISHED status change is applied immediately regardless of endDate', async () => {
      const g = setup()
      const future = new Date()
      future.setDate(future.getDate() + 30)
      const row = makeGroup({ id: 6, endDate: future.toISOString().slice(0, 10) })

      g.setStatus(row, GroupStatus.STARTED)
      await flushPromises()

      expect(mockedChangeStatus).toHaveBeenCalledWith(6, GroupStatus.STARTED)
      expect(g.pendingFinish.value).toBeNull()
    })
  })

  describe('applyStatus() 422 handling', () => {
    it('opens the edit form and sets statusErrors when the 422 carries an endDate field error', async () => {
      mockedChangeStatus.mockRejectedValueOnce({
        response: { data: { errors: { endDate: ['Tugash sanasi kerak'] } } },
      })
      const g = setup()
      const row = makeGroup({ id: 11, endDate: '2020-01-01' })

      g.setStatus(row, GroupStatus.FINISHED)
      await flushPromises()

      expect(g.modalOpen.value).toBe(true)
      expect(g.editing.value).toEqual(row)
      expect(g.statusErrors.value).toEqual({ endDate: 'Tugash sanasi kerak' })
    })

    it('does not open the edit form when the 422 carries no endDate/roomId field error', async () => {
      mockedChangeStatus.mockRejectedValueOnce({
        response: { data: { errors: { other: ['Something else'] } } },
      })
      const g = setup()
      const row = makeGroup({ id: 12, endDate: '2020-01-01' })

      g.setStatus(row, GroupStatus.FINISHED)
      await flushPromises()

      expect(g.modalOpen.value).toBe(false)
      expect(g.editing.value).toBeNull()
    })
  })
})
