import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useCandidates } from '../use-candidates'
import {
  fetchCandidates as fetchCandidatesApi,
  createCandidate as createCandidateApi,
  updateCandidate as updateCandidateApi,
  deleteCandidate as deleteCandidateApi,
} from '../../api/candidates.api'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import { PermissionDeniedError } from '@/shared/permissions/permission-denied-error'
import { Permission } from '@/shared/enums/permission.enum'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { Candidate } from '../../interfaces/candidate.interface'
import type { CandidateForm } from '../../interfaces/candidate-form.interface'

vi.mock('../../api/candidates.api', () => ({
  fetchCandidates: vi.fn(),
  createCandidate: vi.fn(),
  updateCandidate: vi.fn(),
  deleteCandidate: vi.fn(),
}))
vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchCandidatesApi)
const mockedCreate = vi.mocked(createCandidateApi)
const mockedUpdate = vi.mocked(updateCandidateApi)
const mockedDelete = vi.mocked(deleteCandidateApi)
const mockedSubjects = vi.mocked(fetchSubjectsApi)

const CENTER_ID = 5

function makeCandidate(overrides: Partial<Candidate> = {}): Candidate {
  return {
    id: 1,
    centerId: CENTER_ID,
    firstName: 'Ali',
    lastName: 'Valiyev',
    phone: '+998977522014',
    experience: '3 yil',
    birthYear: 1995,
    subjectId: null,
    subject: null,
    address: null,
    comment: null,
    createdAt: '2026-09-01T10:00:00.000Z',
    updatedAt: '2026-09-01T10:00:00.000Z',
    ...overrides,
  }
}

const form: CandidateForm = {
  centerId: CENTER_ID,
  lastName: 'Valiyev',
  firstName: 'Ali',
  phone: '+998977522014',
  experience: '3 yil',
  birthYear: 1995,
  subjectId: null,
  address: null,
  comment: null,
}

describe('useCandidates', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      data: [makeCandidate()],
      meta: { total: 1, page: 1, perPage: 20, totalPages: 3 },
    })
    mockedSubjects.mockResolvedValue({
      data: [{ id: 2, name: 'Matematika' }, { id: 3, name: 'Fizika' }],
      meta: { total: 2 },
    })
    mockedDelete.mockResolvedValue(undefined)
  })

  describe('init()', () => {
    it('loads the rows and maps subjects to select options', async () => {
      const c = useCandidates()
      await c.init()

      expect(mockedFetch).toHaveBeenCalledWith({ search: undefined, subjectId: undefined, page: 1, perPage: 20 })
      expect(mockedSubjects).toHaveBeenCalledWith({ page: 1, perPage: 100 })
      expect(c.rows.value).toHaveLength(1)
      expect(c.total.value).toBe(1)
      expect(c.totalPages.value).toBe(3)
      expect(c.loading.value).toBe(false)
      expect(c.subjects.value).toEqual([
        { label: 'Matematika', value: 2 },
        { label: 'Fizika', value: 3 },
      ])
    })

    it('leaves subjects empty when the subjects request is blocked by permission', async () => {
      mockedSubjects.mockRejectedValueOnce(new PermissionDeniedError('get', '/subjects', [Permission.SUBJECTS_VIEW]))
      const c = useCandidates()

      await expect(c.init()).resolves.toBeUndefined()

      expect(c.subjects.value).toEqual([])
      expect(c.rows.value).toHaveLength(1)
    })

    it('still rejects on a non-permission subjects failure', async () => {
      mockedSubjects.mockRejectedValueOnce(new Error('boom'))
      const c = useCandidates()

      await expect(c.init()).rejects.toThrow('boom')
    })

    it('falls back to rows length / 1 page when meta is sparse', async () => {
      mockedFetch.mockResolvedValueOnce({ data: [makeCandidate(), makeCandidate({ id: 2 })], meta: {} as never })
      const c = useCandidates()
      await c.load()

      expect(c.total.value).toBe(2)
      expect(c.totalPages.value).toBe(1)
    })
  })

  describe('filters', () => {
    it('search() trims, resets page to 1 and passes the term', async () => {
      const c = useCandidates()
      c.filters.page = 3
      c.search('  ali  ')
      await flushPromises()

      expect(c.filters.search).toBe('ali')
      expect(c.filters.page).toBe(1)
      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'ali', page: 1 }))
    })

    it('search() omits a whitespace-only term', async () => {
      const c = useCandidates()
      c.search('   ')
      await flushPromises()

      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ search: undefined }))
    })

    it('setSubject() sets the subject, resets the page and clears it with null', async () => {
      const c = useCandidates()
      c.filters.page = 2
      c.setSubject(3)
      await flushPromises()

      expect(c.filters.page).toBe(1)
      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ subjectId: 3, page: 1 }))

      c.setSubject(null)
      await flushPromises()
      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ subjectId: undefined }))
    })

    it('setPage() loads the requested page', async () => {
      const c = useCandidates()
      c.setPage(2)
      await flushPromises()

      expect(c.filters.page).toBe(2)
      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    })
  })

  describe('submit()', () => {
    it('creates when not editing, notifies, closes the modal and reloads', async () => {
      const c = useCandidates()
      c.openCreate()
      expect(c.modalOpen.value).toBe(true)
      mockedCreate.mockResolvedValueOnce(makeCandidate({ id: 9 }))

      await c.submit(form)

      expect(mockedCreate).toHaveBeenCalledWith(form)
      expect(mockedUpdate).not.toHaveBeenCalled()
      expect(c.modalOpen.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing candidate by id', async () => {
      const c = useCandidates()
      const editing = makeCandidate({ id: 42 })
      c.openEdit(editing)
      expect(c.editing.value).toEqual(editing)
      mockedUpdate.mockResolvedValueOnce(editing)

      await c.submit(form)

      expect(mockedCreate).not.toHaveBeenCalled()
      expect(mockedUpdate).toHaveBeenCalledWith(42, form)
      expect(c.modalOpen.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('openCreate() after an edit clears the editing value', () => {
      const c = useCandidates()
      c.openEdit(makeCandidate({ id: 42 }))
      c.openCreate()
      expect(c.editing.value).toBeNull()
    })

    it('keeps the modal open when the api rejects', async () => {
      const c = useCandidates()
      c.openCreate()
      mockedCreate.mockRejectedValueOnce(new Error('422'))

      await expect(c.submit(form)).rejects.toThrow('422')
      expect(c.modalOpen.value).toBe(true)
    })
  })

  describe('delete flow', () => {
    it('confirmDelete deletes the target, notifies, clears it and reloads', async () => {
      const c = useCandidates()
      await c.load()
      mockedFetch.mockClear()
      const target = makeCandidate({ id: 7 })

      c.requestDelete(target)
      expect(c.deleteTarget.value).toEqual(target)
      await c.confirmDelete()

      expect(mockedDelete).toHaveBeenCalledWith(7)
      expect(c.deleteTarget.value).toBeNull()
      expect(c.deleting.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('steps back a page when the last row of a page > 1 is deleted', async () => {
      const c = useCandidates()
      c.setPage(3)
      await flushPromises()
      expect(c.rows.value).toHaveLength(1)

      c.requestDelete(c.rows.value[0]!)
      await c.confirmDelete()

      expect(c.filters.page).toBe(2)
      expect(mockedFetch).toHaveBeenLastCalledWith(expect.objectContaining({ page: 2 }))
    })

    it('stays on page 1 when its last row is deleted', async () => {
      const c = useCandidates()
      await c.load()

      c.requestDelete(c.rows.value[0]!)
      await c.confirmDelete()

      expect(c.filters.page).toBe(1)
    })

    it('stays on the page when other rows remain', async () => {
      mockedFetch.mockResolvedValue({
        data: [makeCandidate(), makeCandidate({ id: 2 })],
        meta: { total: 42, page: 2, perPage: 20, totalPages: 3 },
      })
      const c = useCandidates()
      c.setPage(2)
      await flushPromises()

      c.requestDelete(c.rows.value[0]!)
      await c.confirmDelete()

      expect(c.filters.page).toBe(2)
    })

    it('does nothing without a target', async () => {
      const c = useCandidates()
      await c.confirmDelete()
      expect(mockedDelete).not.toHaveBeenCalled()
    })

    it('cancelDelete clears the target without calling the api', () => {
      const c = useCandidates()
      c.requestDelete(makeCandidate())
      c.cancelDelete()

      expect(c.deleteTarget.value).toBeNull()
      expect(mockedDelete).not.toHaveBeenCalled()
    })

    it('ignores a second confirmDelete while the first is in flight', async () => {
      let resolve!: () => void
      mockedDelete.mockReturnValueOnce(new Promise<void>((r) => (resolve = r)))
      const c = useCandidates()
      c.requestDelete(makeCandidate({ id: 7 }))

      const first = c.confirmDelete()
      expect(c.deleting.value).toBe(true)
      await c.confirmDelete()
      resolve()
      await first

      expect(mockedDelete).toHaveBeenCalledTimes(1)
      expect(c.deleting.value).toBe(false)
    })
  })
})
