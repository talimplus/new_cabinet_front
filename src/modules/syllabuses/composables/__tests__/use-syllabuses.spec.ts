import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useSyllabuses } from '../use-syllabuses'
import {
  fetchSyllabuses as fetchSyllabusesApi,
  deleteSyllabus as deleteSyllabusApi,
} from '../../api/syllabuses.api'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import type { SyllabusListItem } from '../../interfaces/syllabus.interface'

vi.mock('../../api/syllabuses.api', () => ({
  fetchSyllabuses: vi.fn(),
  deleteSyllabus: vi.fn(),
}))
vi.mock('@/modules/subjects/api/subjects.api', () => ({ fetchSubjects: vi.fn() }))
// init() calls scope.loadCenters(); mock the centers api so it never hits http.
vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn().mockResolvedValue([{ id: 5, name: 'Markaz', isDefault: true }]),
}))

const mockedFetch = vi.mocked(fetchSyllabusesApi)
const mockedDelete = vi.mocked(deleteSyllabusApi)
const mockedFetchSubjects = vi.mocked(fetchSubjectsApi)


function makeItem(overrides: Partial<SyllabusListItem> = {}): SyllabusListItem {
  return {
    id: 1,
    name: 'JS',
    description: null,
    subject: { id: 2, name: 'Programming' },
    topicsCount: 3,
    createdAt: '2026-01-01',
    ...overrides,
  }
}

describe('useSyllabuses', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetch.mockResolvedValue({
      data: [makeItem()],
      meta: { total: 1, page: 1, perPage: 10, totalPages: 4 },
    })
    mockedFetchSubjects.mockResolvedValue({
      data: [{ id: 2, name: 'Programming' }],
      meta: { total: 1, page: 1, perPage: 100, totalPages: 1 },
    })
    mockedDelete.mockResolvedValue(undefined)
  })


  it('builds params from the center and strips empty filters', async () => {
    const s = useSyllabuses()
    s.applyFilters()
    await flushPromises()

    expect(mockedFetch).toHaveBeenCalledWith({
      subjectId: undefined,
      name: undefined,
      page: 1,
      perPage: 10,
    })
    expect(s.rows.value).toHaveLength(1)
    expect(s.totalPages.value).toBe(4)
  })

  it('search sets the name filter, resets to page 1, and reloads', async () => {
    const s = useSyllabuses()
    s.filters.page = 3
    s.search('js')
    await flushPromises()

    expect(mockedFetch).toHaveBeenLastCalledWith(
      expect.objectContaining({ name: 'js', page: 1 }),
    )
  })

  it('loadSubjects maps subjects to select options', async () => {
    const s = useSyllabuses()
    await s.init()
    await flushPromises()

    expect(mockedFetchSubjects).toHaveBeenCalledWith({ page: 1, perPage: 100 })
    expect(s.subjectOptions.value).toEqual([{ label: 'Programming', value: 2 }])
  })

  it('delete flow: requestDelete stores the target, confirmDelete deletes, notifies, reloads', async () => {
    const s = useSyllabuses()
    const item = makeItem({ id: 42 })

    s.requestDelete(item)
    expect(s.deleteTarget.value).toEqual(item)

    await s.confirmDelete()
    await flushPromises()

    expect(mockedDelete).toHaveBeenCalledWith(42)
    expect(s.deleteTarget.value).toBeNull()
    const notify = useNotificationStore()
    expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })

  it('confirmDelete is a no-op when nothing is targeted', async () => {
    const s = useSyllabuses()
    await s.confirmDelete()
    expect(mockedDelete).not.toHaveBeenCalled()
  })
})
