import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useGroupPlan } from '../use-group-plan'
import {
  fetchGroupPlan as fetchGroupPlanApi,
  fetchSyllabuses as fetchSyllabusesApi,
  setGroupSyllabus as setGroupSyllabusApi,
  setLessonTopics as setLessonTopicsApi,
  distributePlan as distributePlanApi,
} from '../../api/group-plan.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { GroupStatus } from '../../enums/group-status.enum'
import type { GroupPlan } from '../../interfaces/group-plan.interface'

vi.mock('../../api/group-plan.api', () => ({
  fetchGroupPlan: vi.fn(),
  fetchSyllabuses: vi.fn(),
  setGroupSyllabus: vi.fn(),
  setLessonTopics: vi.fn(),
  distributePlan: vi.fn(),
}))

const mockedFetchPlan = vi.mocked(fetchGroupPlanApi)
const mockedFetchSyllabuses = vi.mocked(fetchSyllabusesApi)
const mockedSetSyllabus = vi.mocked(setGroupSyllabusApi)
const mockedSetLessonTopics = vi.mocked(setLessonTopicsApi)
const mockedDistribute = vi.mocked(distributePlanApi)

const GROUP_ID = 12

function makePlan(withSyllabus: boolean): GroupPlan {
  return {
    group: {
      id: GROUP_ID,
      name: 'G-1',
      status: GroupStatus.STARTED,
      startDate: null,
      endDate: null,
      durationMonths: null,
      subject: { id: 2, name: 'Matematika' },
    },
    syllabus: withSyllabus
      ? {
          id: 7,
          name: 'Algebra',
          description: null,
          topics: [
            { id: 5, orderIndex: 1, title: 'T1', description: null, difficulty: null, estimatedLessons: null, guide: null, lessonOutline: null, homework: null },
            { id: 8, orderIndex: 2, title: 'T2', description: null, difficulty: null, estimatedLessons: null, guide: null, lessonOutline: null, homework: null },
          ],
        }
      : null,
    timezone: 'Asia/Tashkent',
    today: '2026-09-06',
    totalLessons: withSyllabus ? 2 : null,
    horizonDate: null,
    lessons: withSyllabus
      ? [{ lessonNumber: 1, date: '2026-09-07', isPast: false, isToday: false, topics: [] }]
      : [],
  }
}

describe('useGroupPlan', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedFetchSyllabuses.mockResolvedValue({
      data: [{ id: 7, name: 'Algebra', description: null, subject: { id: 2, name: 'Matematika' }, topicsCount: 2, createdAt: '' }],
      meta: { total: 1, page: 1, perPage: 100, totalPages: 1 },
    })
    mockedSetSyllabus.mockResolvedValue(undefined)
    mockedSetLessonTopics.mockResolvedValue(undefined)
  })

  it('init loads the plan and fetches syllabuses when none attached', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(false))
    const g = useGroupPlan(GROUP_ID, { getSubjectId: () => 2 })

    await g.init()
    await flushPromises()

    expect(mockedFetchPlan).toHaveBeenCalledWith(GROUP_ID)
    expect(mockedFetchSyllabuses).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: 2, page: 1, perPage: 100 }),
    )
    expect(g.syllabusOptions.value).toEqual([{ label: 'Algebra', value: 7 }])
  })

  it('attachSyllabus attaches the selected id, notifies and reloads', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(false))
    const g = useGroupPlan(GROUP_ID)
    await g.init()
    await flushPromises()
    mockedFetchPlan.mockClear()

    g.selectedSyllabusId.value = 7
    await g.attachSyllabus()
    await flushPromises()

    expect(mockedSetSyllabus).toHaveBeenCalledWith(GROUP_ID, 7)
    expect(mockedFetchPlan).toHaveBeenCalledWith(GROUP_ID)
    expect(useNotificationStore().items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })

  it('detachSyllabus sends null then reloads plan and syllabuses', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(true))
    const g = useGroupPlan(GROUP_ID)
    await g.init()
    await flushPromises()
    mockedFetchPlan.mockClear()
    mockedFetchSyllabuses.mockClear()

    await g.detachSyllabus()
    await flushPromises()

    expect(mockedSetSyllabus).toHaveBeenCalledWith(GROUP_ID, null)
    expect(mockedFetchPlan).toHaveBeenCalledWith(GROUP_ID)
    expect(mockedFetchSyllabuses).toHaveBeenCalled()
  })

  it('saveLessonTopics sends the working selection and reloads', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(true))
    const g = useGroupPlan(GROUP_ID)
    await g.init()
    await flushPromises()

    g.toggleTopic(1, 5, true)
    g.toggleTopic(1, 8, true)
    expect(g.isLessonDirty(1)).toBe(true)

    mockedFetchPlan.mockClear()
    await g.saveLessonTopics(1)
    await flushPromises()

    expect(mockedSetLessonTopics).toHaveBeenCalledWith(GROUP_ID, 1, [5, 8])
    expect(mockedFetchPlan).toHaveBeenCalledWith(GROUP_ID)
  })

  it('runDistribute maps the form, replaces the plan and reloads selections', async () => {
    mockedFetchPlan.mockResolvedValue(makePlan(true))
    const g = useGroupPlan(GROUP_ID)
    await g.init()
    await flushPromises()

    mockedDistribute.mockResolvedValueOnce(makePlan(true))
    g.openDistribute()
    g.distribute.totalLessons = 24
    g.distribute.instructions = '  tez  '
    await g.runDistribute()
    await flushPromises()

    expect(mockedDistribute).toHaveBeenCalledWith(GROUP_ID, { totalLessons: 24, instructions: 'tez' })
    expect(g.distribute.open).toBe(false)
    expect(useNotificationStore().items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
  })
})
