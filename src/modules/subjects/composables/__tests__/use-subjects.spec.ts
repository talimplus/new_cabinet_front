import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useSubjects } from '../use-subjects'
import {
  fetchSubjects as fetchSubjectsApi,
  createSubject as createSubjectApi,
  updateSubject as updateSubjectApi,
  deleteSubject as deleteSubjectApi,
} from '../../api/subjects.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { Subject } from '../../interfaces/subject.interface'
import type { SubjectForm } from '../../interfaces/subject-form.interface'

vi.mock('../../api/subjects.api', () => ({
  fetchSubjects: vi.fn(),
  createSubject: vi.fn(),
  updateSubject: vi.fn(),
  deleteSubject: vi.fn(),
}))

const mockedFetchSubjects = vi.mocked(fetchSubjectsApi)
const mockedCreateSubject = vi.mocked(createSubjectApi)
const mockedUpdateSubject = vi.mocked(updateSubjectApi)
const mockedDeleteSubject = vi.mocked(deleteSubjectApi)

const CENTER_ID = 5

function makeSubject(overrides: Partial<Subject> = {}): Subject {
  return { id: 1, name: 'Math', ...overrides }
}

const form: SubjectForm = { name: 'Physics', centerId: CENTER_ID }

describe('useSubjects', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchSubjects.mockResolvedValue({
      data: [makeSubject()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 4 },
    })
  })

  describe('init()/load()', () => {
    it('fetches with default filters and populates rows + totalPages', async () => {
      const s = useSubjects()
      await s.init()

      expect(mockedFetchSubjects).toHaveBeenCalledWith({ name: undefined, page: 1, perPage: 10 })
      expect(s.rows.value).toHaveLength(1)
      expect(s.rows.value[0]).toEqual(makeSubject())
      expect(s.totalPages.value).toBe(4)
    })
  })

  describe('search()', () => {
    it('sets the name filter, resets to page 1, and reloads', async () => {
      const s = useSubjects()
      await s.init()
      s.setPage(3)
      await flushPromises()

      s.search('math')
      await flushPromises()

      expect(s.filters.name).toBe('math')
      expect(s.filters.page).toBe(1)
      expect(mockedFetchSubjects).toHaveBeenLastCalledWith({ name: 'math', page: 1, perPage: 10 })
    })

    it('sends name: undefined for an empty search string', async () => {
      const s = useSubjects()
      s.search('')
      await flushPromises()

      expect(mockedFetchSubjects).toHaveBeenLastCalledWith({
        name: undefined,
        page: 1,
        perPage: 10,
      })
    })
  })

  describe('setPage()', () => {
    it('updates the page filter and reloads', async () => {
      const s = useSubjects()
      s.setPage(3)
      await flushPromises()

      expect(s.filters.page).toBe(3)
      expect(mockedFetchSubjects).toHaveBeenLastCalledWith({
        name: undefined,
        page: 3,
        perPage: 10,
      })
    })
  })

  describe('modal state', () => {
    it('openCreate clears editing and opens the modal', () => {
      const s = useSubjects()
      s.openEdit(makeSubject())
      s.openCreate()

      expect(s.editing.value).toBeNull()
      expect(s.modalOpen.value).toBe(true)
    })

    it('openEdit sets editing to the given subject and opens the modal', () => {
      const s = useSubjects()
      const subject = makeSubject({ id: 9, name: 'Chemistry' })
      s.openEdit(subject)

      expect(s.editing.value).toEqual(subject)
      expect(s.modalOpen.value).toBe(true)
    })
  })

  describe('submit()', () => {
    it('creates when not editing, then notifies, closes the modal and reloads', async () => {
      const s = useSubjects()
      s.openCreate()
      mockedCreateSubject.mockResolvedValueOnce(makeSubject({ id: 99 }))

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateSubject).toHaveBeenCalledWith(form)
      expect(mockedUpdateSubject).not.toHaveBeenCalled()
      expect(s.modalOpen.value).toBe(false)
      expect(mockedFetchSubjects).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })

    it('updates the editing subject by id', async () => {
      const s = useSubjects()
      const editing = makeSubject({ id: 42 })
      s.openEdit(editing)
      mockedUpdateSubject.mockResolvedValueOnce(editing)

      await s.submit(form)
      await flushPromises()

      expect(mockedCreateSubject).not.toHaveBeenCalled()
      expect(mockedUpdateSubject).toHaveBeenCalledWith(42, form)
      expect(s.modalOpen.value).toBe(false)
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })

  describe('remove()', () => {
    it('deletes the subject by id, notifies and reloads', async () => {
      const s = useSubjects()
      mockedDeleteSubject.mockResolvedValueOnce(undefined)
      const target = makeSubject({ id: 7 })

      await s.remove(target)
      await flushPromises()

      expect(mockedDeleteSubject).toHaveBeenCalledWith(7)
      expect(mockedFetchSubjects).toHaveBeenCalled()
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })
})
