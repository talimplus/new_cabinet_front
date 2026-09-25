import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchGroupPlan,
  setGroupSyllabus,
  setLessonTopics,
  distributePlan,
  fetchSyllabuses,
} from '../group-plan.api'
import { http } from '@/shared/api/http'
import type { GroupPlan } from '../../interfaces/group-plan.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('group-plan.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchGroupPlan GETs /groups/{id}/plan and returns the body', async () => {
    const plan = { syllabus: null, lessons: [] } as unknown as GroupPlan
    mockedHttp.get.mockResolvedValueOnce({ data: plan })

    const result = await fetchGroupPlan(12)

    expect(mockedHttp.get).toHaveBeenCalledWith('/groups/12/plan')
    expect(result).toEqual(plan)
  })

  it('setGroupSyllabus PUTs the syllabusId to attach', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await setGroupSyllabus(12, 7)

    expect(mockedHttp.put).toHaveBeenCalledWith('/groups/12/plan/syllabus', { syllabusId: 7 })
  })

  it('setGroupSyllabus PUTs null to detach', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await setGroupSyllabus(12, null)

    expect(mockedHttp.put).toHaveBeenCalledWith('/groups/12/plan/syllabus', { syllabusId: null })
  })

  it('setLessonTopics PUTs the { topicIds } body to the lesson endpoint', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await setLessonTopics(12, 3, [5, 8])

    expect(mockedHttp.put).toHaveBeenCalledWith('/groups/12/plan/lessons/3/topics', {
      topicIds: [5, 8],
    })
  })

  it('distributePlan POSTs the form and returns the recomputed plan', async () => {
    const plan = { lessons: [{ lessonNumber: 1 }] } as unknown as GroupPlan
    mockedHttp.post.mockResolvedValueOnce({ data: plan })

    const result = await distributePlan(12, { totalLessons: 24, instructions: 'tez' })

    expect(mockedHttp.post).toHaveBeenCalledWith('/groups/12/plan/distribute', {
      totalLessons: 24,
      instructions: 'tez',
    })
    expect(result).toEqual(plan)
  })

  it('fetchSyllabuses GETs /syllabuses with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'Algebra' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchSyllabuses({ centerId: 1, subjectId: 2, page: 1, perPage: 100 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/syllabuses', {
      params: { centerId: 1, subjectId: 2, page: 1, perPage: 100 },
    })
    expect(result).toEqual(body)
  })
})
