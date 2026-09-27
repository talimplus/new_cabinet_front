import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAbsences } from '../use-absences'
import { fetchAbsences, saveAbsenceFollowUp } from '../../api/absences.api'
import { fetchAllGroups } from '@/modules/groups/api/groups.api'
import { fetchTeachers } from '@/modules/users/api/users.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { AttendanceStatus } from '@/modules/groups/enums/attendance-status.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { FollowUpFilter } from '../../enums/follow-up-filter.enum'
import { t } from '@/locales'
import type { Absence, AbsencesResponse } from '../../interfaces/absence.interface'
import type { Group } from '@/modules/groups/interfaces/group.interface'
import type { Employee } from '@/modules/users/interfaces/employee.interface'

vi.mock('../../api/absences.api', () => ({
  fetchAbsences: vi.fn(),
  saveAbsenceFollowUp: vi.fn(),
}))
vi.mock('@/modules/groups/api/groups.api', () => ({
  fetchAllGroups: vi.fn(),
}))
vi.mock('@/modules/users/api/users.api', () => ({
  fetchTeachers: vi.fn(),
}))

const mockedFetchAbsences = vi.mocked(fetchAbsences)
const mockedSave = vi.mocked(saveAbsenceFollowUp)
const mockedFetchGroups = vi.mocked(fetchAllGroups)
const mockedFetchTeachers = vi.mocked(fetchTeachers)

function makeAbsence(overrides: Partial<Absence> = {}): Absence {
  return {
    id: 1,
    lessonDate: '2026-09-24',
    status: AttendanceStatus.ABSENT,
    comment: null,
    followUpNote: null,
    followedUpAt: null,
    followedUpBy: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev', phone: '998901234567', secondPhone: null },
    group: { id: 3, name: 'English A1' },
    teacher: { id: 10, firstName: 'Olim', lastName: 'Karimov' },
    absencesInRange: 1,
    ...overrides,
  }
}

function makeResponse(overrides: Partial<AbsencesResponse> = {}): AbsencesResponse {
  return {
    data: [makeAbsence()],
    meta: { total: 45, page: 1, perPage: 20, totalPages: 3 },
    summary: { absent: 4, excused: 2, notFollowedUp: 5 },
    ...overrides,
  }
}

function makeGroup(overrides: Partial<Group> = {}): Group {
  return { id: 3, name: 'English A1', monthlyFee: '400000', ...overrides }
}

function makeEmployee(overrides: Partial<Employee> = {}): Employee {
  return { id: 10, firstName: 'Olim', lastName: 'Karimov', role: UserRole.TEACHER, ...overrides }
}

async function flush(): Promise<void> {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}

describe('useAbsences', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchAbsences.mockResolvedValue(makeResponse())
    mockedFetchGroups.mockResolvedValue([makeGroup(), makeGroup({ id: 4, name: 'Math' })])
    mockedFetchTeachers.mockResolvedValue([makeEmployee(), makeEmployee({ id: 11, firstName: undefined, lastName: undefined })])
    mockedSave.mockResolvedValue({ id: 1, followUpNote: 'kasal', followedUpAt: '2026-09-24T10:00:00.000Z' })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('init()', () => {
    it('loads rows, summary, totalPages and the group/teacher options', async () => {
      const s = useAbsences()

      await s.init()

      expect(s.rows.value).toEqual([makeAbsence()])
      expect(s.summary.value).toEqual({ absent: 4, excused: 2, notFollowedUp: 5 })
      expect(s.totalPages.value).toBe(3)
      expect(s.loading.value).toBe(false)
      expect(mockedFetchGroups).toHaveBeenCalledWith(undefined, undefined)
      expect(s.groupOptions.value).toEqual([
        { label: 'English A1', value: 3 },
        { label: 'Math', value: 4 },
      ])
      expect(mockedFetchTeachers).toHaveBeenCalledTimes(1)
      expect(s.teacherOptions.value).toEqual([
        { label: 'Olim Karimov', value: 10 },
        { label: '#11', value: 11 },
      ])
    })

    it('falls back to totalPages 1 when meta has none', async () => {
      mockedFetchAbsences.mockResolvedValueOnce(
        makeResponse({ data: [], meta: { total: 0, page: 1, perPage: 20, totalPages: 0 } }),
      )
      const s = useAbsences()
      await s.init()
      expect(s.totalPages.value).toBe(1)
    })
  })

  describe('request params', () => {
    it('defaults: page 1, followedUp=false, from/to set, no group/teacher/status/search', async () => {
      const s = useAbsences()
      await s.load()

      const params = mockedFetchAbsences.mock.calls[0]![0]
      expect(params.page).toBe(1)
      expect(params.perPage).toBe(20)
      expect(params.followedUp).toBe(false)
      expect(params.from).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(params.to).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(params.from! < params.to!).toBe(true)
      expect(params.groupId).toBeUndefined()
      expect(params.teacherId).toBeUndefined()
      expect(params.status).toBeUndefined()
      expect(params.search).toBeUndefined()
    })

    it('FollowUpFilter.ALL sends followedUp undefined', async () => {
      const s = useAbsences()
      s.filters.followUp = FollowUpFilter.ALL
      await s.load()
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ followedUp: undefined }))
    })

    it('FollowUpFilter.DONE sends followedUp true', async () => {
      const s = useAbsences()
      s.filters.followUp = FollowUpFilter.DONE
      await s.load()
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ followedUp: true }))
    })

    it('passes status, trimmed search and groupId through', async () => {
      const s = useAbsences()
      s.filters.status = AttendanceStatus.EXCUSED
      s.filters.search = '  Ali  '
      s.filters.groupId = 3
      await s.load()
      expect(mockedFetchAbsences).toHaveBeenCalledWith(
        expect.objectContaining({ status: AttendanceStatus.EXCUSED, search: 'Ali', groupId: 3 }),
      )
    })

    it('drops a whitespace-only search', async () => {
      const s = useAbsences()
      s.filters.search = '   '
      await s.load()
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ search: undefined }))
    })
  })

  describe('reload / reloadDebounced / setPage', () => {
    it('setPage fetches with the new page', async () => {
      const s = useAbsences()
      s.setPage(4)
      await flush()
      expect(s.filters.page).toBe(4)
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ page: 4 }))
    })

    it('reload resets the page to 1', async () => {
      const s = useAbsences()
      s.filters.page = 3
      s.reload()
      await flush()
      expect(s.filters.page).toBe(1)
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    })

    it('reloadDebounced fetches once after the debounce window', async () => {
      vi.useFakeTimers()
      const s = useAbsences()
      s.reloadDebounced()
      s.reloadDebounced()
      expect(mockedFetchAbsences).not.toHaveBeenCalled()
      vi.advanceTimersByTime(350)
      expect(mockedFetchAbsences).toHaveBeenCalledTimes(1)
    })
  })

  describe('setTeacher()', () => {
    it('reloads groups for the teacher and clears a groupId not in the new list', async () => {
      const s = useAbsences()
      await s.init()
      s.filters.groupId = 4
      mockedFetchGroups.mockClear()
      mockedFetchAbsences.mockClear()
      mockedFetchGroups.mockResolvedValueOnce([makeGroup({ id: 3 })])

      s.setTeacher(10)
      await flush()

      expect(s.filters.teacherId).toBe(10)
      expect(mockedFetchGroups).toHaveBeenCalledWith(undefined, 10)
      expect(s.groupOptions.value).toEqual([{ label: 'English A1', value: 3 }])
      expect(s.filters.groupId).toBeNull()
      expect(mockedFetchAbsences).toHaveBeenCalledWith(expect.objectContaining({ teacherId: 10, page: 1 }))
    })

    it('keeps a groupId that is still in the new list', async () => {
      const s = useAbsences()
      s.filters.groupId = 3
      mockedFetchGroups.mockResolvedValueOnce([makeGroup({ id: 3 })])

      s.setTeacher(10)
      await flush()

      expect(s.filters.groupId).toBe(3)
    })
  })

  describe('follow-up modal', () => {
    it('openFollowUp pre-fills the note from row.followUpNote', () => {
      const s = useAbsences()
      const row = makeAbsence({ id: 7, followUpNote: 'kasal' })

      s.openFollowUp(row)

      expect(s.followUp.row).toEqual(row)
      expect(s.followUp.note).toBe('kasal')
      expect(s.followUpOpen.value).toBe(true)
    })

    it('openFollowUp uses an empty note when the row has none', () => {
      const s = useAbsences()
      s.followUp.note = 'stale'
      s.openFollowUp(makeAbsence({ followUpNote: null }))
      expect(s.followUp.note).toBe('')
    })

    it('submitFollowUp saves the trimmed note, notifies, closes and reloads', async () => {
      const s = useAbsences()
      s.openFollowUp(makeAbsence({ id: 42 }))
      s.followUp.note = '  kasal  '
      mockedFetchAbsences.mockClear()

      await s.submitFollowUp()

      expect(mockedSave).toHaveBeenCalledWith(42, { note: 'kasal' })
      expect(s.followUp.row).toBeNull()
      expect(s.followUpOpen.value).toBe(false)
      expect(s.followUp.saving).toBe(false)
      expect(mockedFetchAbsences).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items).toContainEqual(
        expect.objectContaining({
          type: NotificationType.SUCCESS,
          message: t('absences.messages.saved'),
        }),
      )
    })

    it('submitFollowUp is a no-op with no open row', async () => {
      const s = useAbsences()
      await s.submitFollowUp()
      expect(mockedSave).not.toHaveBeenCalled()
    })

    it('closeFollowUp closes the modal, but is ignored while saving', () => {
      const s = useAbsences()
      s.openFollowUp(makeAbsence())

      s.followUp.saving = true
      s.closeFollowUp()
      expect(s.followUp.row).not.toBeNull()

      s.followUp.saving = false
      s.closeFollowUp()
      expect(s.followUp.row).toBeNull()
    })
  })

  describe('filter setters', () => {
    it('setFilters patches filters, resets page and reloads', async () => {
      const a = useAbsences()
      a.filters.page = 3
      a.setFilters({ groupId: 4, status: AttendanceStatus.ABSENT })
      await vi.waitFor(() => expect(mockedFetchAbsences).toHaveBeenCalled())
      expect(a.filters.page).toBe(1)
      expect(mockedFetchAbsences).toHaveBeenLastCalledWith(
        expect.objectContaining({ groupId: 4, status: AttendanceStatus.ABSENT, page: 1 }),
      )
    })

    it('setSearch stores the text and reloads after the debounce', () => {
      vi.useFakeTimers()
      const a = useAbsences()
      a.setSearch('Ali')
      expect(a.filters.search).toBe('Ali')
      expect(mockedFetchAbsences).not.toHaveBeenCalled()
      vi.advanceTimersByTime(400)
      expect(mockedFetchAbsences).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'Ali' }))
      vi.useRealTimers()
    })

    it('setNote updates the follow-up note', () => {
      const a = useAbsences()
      a.setNote('kasal')
      expect(a.followUp.note).toBe('kasal')
    })
  })

  describe('race safety', () => {
    it('setTeacher drops a group of the previous teacher before reloading', async () => {
      const a = useAbsences()
      a.filters.groupId = 4
      mockedFetchGroups.mockResolvedValueOnce([makeGroup({ id: 3 })])
      await a.setTeacher(10)
      await vi.waitFor(() => expect(mockedFetchAbsences).toHaveBeenCalled())
      expect(mockedFetchAbsences).toHaveBeenLastCalledWith(
        expect.objectContaining({ teacherId: 10, groupId: undefined }),
      )
    })

    it('a slow earlier response does not overwrite newer rows', async () => {
      const a = useAbsences()
      let resolveSlow!: (v: AbsencesResponse) => void
      mockedFetchAbsences
        .mockReturnValueOnce(new Promise((r) => { resolveSlow = r }))
        .mockResolvedValueOnce(makeResponse({ data: [makeAbsence({ id: 2 })] }))
      const slow = a.load()
      await a.load()
      resolveSlow(makeResponse({ data: [makeAbsence({ id: 1 })] }))
      await slow
      expect(a.rows.value.map((r) => r.id)).toEqual([2])
      expect(a.loading.value).toBe(false)
    })
  })
})
