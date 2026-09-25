import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useSyllabusDetail } from '../use-syllabus-detail'
import {
  fetchSyllabusById as fetchSyllabusByIdApi,
  createTopic as createTopicApi,
  reorderTopics as reorderTopicsApi,
} from '../../api/syllabuses.api'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import { useNotificationStore } from '@/stores/notification.store'
import { NotificationType } from '@/shared/enums/notification-type.enum'
import { TopicDifficulty } from '../../enums/topic-difficulty.enum'
import type { Syllabus } from '../../interfaces/syllabus.interface'
import type { SyllabusTopic } from '../../interfaces/syllabus-topic.interface'
import type { Subject } from '@/modules/subjects/interfaces/subject.interface'

// Route id is read live via useRoute() — pin it to '7'.
vi.mock('vue-router', () => ({ useRoute: () => ({ params: { id: '7' } }) }))

vi.mock('../../api/syllabuses.api', () => ({
  fetchSyllabusById: vi.fn(),
  createTopic: vi.fn(),
  reorderTopics: vi.fn(),
}))

vi.mock('@/modules/subjects/api/subjects.api', () => ({
  fetchSubjects: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchSyllabusByIdApi)
const mockedCreate = vi.mocked(createTopicApi)
const mockedReorder = vi.mocked(reorderTopicsApi)
const mockedFetchSubjects = vi.mocked(fetchSubjectsApi)

function makeTopic(id: number, orderIndex: number, extra: Partial<SyllabusTopic> = {}): SyllabusTopic {
  return {
    id,
    orderIndex,
    title: `Topic ${id}`,
    description: null,
    difficulty: null,
    estimatedLessons: null,
    guide: null,
    lessonOutline: null,
    homework: null,
    ...extra,
  }
}

function makeSyllabus(topics: SyllabusTopic[], extra: Partial<Syllabus> = {}): Syllabus {
  return {
    id: 7,
    name: 'Matematika',
    description: null,
    subject: { id: 1, name: 'Matematika' },
    topics,
    ...extra,
  }
}

function makeSubject(id: number, name: string): Subject {
  return { id, name }
}

describe('useSyllabusDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('load()', () => {
    it('sorts the topics by orderIndex', async () => {
      mockedFetch.mockResolvedValue(makeSyllabus([makeTopic(1, 2), makeTopic(2, 0), makeTopic(3, 1)]))
      const s = useSyllabusDetail()

      await s.load()

      expect(mockedFetch).toHaveBeenCalledWith('7')
      expect(s.topics.value.map((t) => t.id)).toEqual([2, 3, 1])
      expect(s.syllabus.value?.name).toBe('Matematika')
    })
  })

  describe('submitAddTopic()', () => {
    it('creates the topic, closes the dialog, notifies and reloads', async () => {
      mockedFetch.mockResolvedValue(makeSyllabus([]))
      mockedCreate.mockResolvedValue(makeTopic(9, 0))
      const s = useSyllabusDetail()
      await s.load()
      mockedFetch.mockClear()

      s.addOpen.value = true
      await s.submitAddTopic({ title: 'Yangi', difficulty: TopicDifficulty.EASY })
      await flushPromises()

      expect(mockedCreate).toHaveBeenCalledWith('7', { title: 'Yangi', difficulty: TopicDifficulty.EASY })
      expect(s.addOpen.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1) // reload
      const notify = useNotificationStore()
      expect(notify.items.some((n) => n.type === NotificationType.SUCCESS)).toBe(true)
    })
  })

  describe('openEditSyllabus()', () => {
    it('loads subjects for the syllabus center, fills subjectOptions and opens the modal', async () => {
      mockedFetch.mockResolvedValue(
        makeSyllabus([], { center: { id: 4, name: 'Chilonzor' } }),
      )
      mockedFetchSubjects.mockResolvedValueOnce({
        data: [makeSubject(1, 'Matematika'), makeSubject(2, 'Fizika')],
        meta: { total: 2, page: 1, perPage: 100, totalPages: 1 },
      })
      const s = useSyllabusDetail()
      await s.load()

      await s.openEditSyllabus()

      expect(mockedFetchSubjects).toHaveBeenCalledWith({ centerId: 4, page: 1, perPage: 100 })
      expect(s.subjectOptions.value).toEqual([
        { label: 'Matematika', value: 1 },
        { label: 'Fizika', value: 2 },
      ])
      expect(s.editOpen.value).toBe(true)
    })
  })

  describe('reorder()', () => {
    it('optimistically reorders and persists the new id order', async () => {
      mockedFetch.mockResolvedValue(makeSyllabus([makeTopic(1, 0), makeTopic(2, 1), makeTopic(3, 2)]))
      mockedReorder.mockResolvedValue(undefined as unknown as void)
      const s = useSyllabusDetail()
      await s.load()

      await s.reorder(0, 2) // move first topic to the end

      expect(s.topics.value.map((t) => t.id)).toEqual([2, 3, 1])
      expect(mockedReorder).toHaveBeenCalledWith('7', [2, 3, 1])
    })

    it('rolls back the local order when the request fails', async () => {
      mockedFetch.mockResolvedValue(makeSyllabus([makeTopic(1, 0), makeTopic(2, 1), makeTopic(3, 2)]))
      mockedReorder.mockRejectedValueOnce(new Error('boom'))
      const s = useSyllabusDetail()
      await s.load()

      await s.reorder(0, 2)
      await flushPromises()

      expect(s.topics.value.map((t) => t.id)).toEqual([1, 2, 3]) // restored
    })

    it('is a no-op when the indices match', async () => {
      mockedFetch.mockResolvedValue(makeSyllabus([makeTopic(1, 0), makeTopic(2, 1)]))
      const s = useSyllabusDetail()
      await s.load()

      await s.reorder(1, 1)

      expect(mockedReorder).not.toHaveBeenCalled()
    })
  })
})
