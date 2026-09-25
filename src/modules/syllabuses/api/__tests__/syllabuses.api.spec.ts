import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchSyllabuses,
  fetchSyllabusById,
  createSyllabus,
  updateSyllabus,
  deleteSyllabus,
  createTopic,
  updateTopic,
  deleteTopic,
  reorderTopics,
  generateTopicContent,
  aiChat,
  aiSavePlan,
} from '../syllabuses.api'
import { http } from '@/shared/api/http'
import { TopicDifficulty } from '../../enums/topic-difficulty.enum'
import { ChatRole } from '../../enums/chat-role.enum'
import { AiResponseType } from '../../enums/ai-response-type.enum'
import type { SyllabusForm } from '../../interfaces/syllabus-form.interface'
import type { TopicForm } from '../../interfaces/topic-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('syllabuses.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchSyllabuses GETs /syllabuses with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'JS' }], meta: { total: 1, page: 1, perPage: 10, totalPages: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const params = { centerId: 3, subjectId: 2, name: 'js', page: 1, perPage: 10 }
    const result = await fetchSyllabuses(params)

    expect(mockedHttp.get).toHaveBeenCalledWith('/syllabuses', { params })
    expect(result).toEqual(body)
  })

  it('fetchSyllabusById GETs /syllabuses/{id} and returns the entity', async () => {
    const entity = { id: 7, name: 'JS', topics: [] }
    mockedHttp.get.mockResolvedValueOnce({ data: entity })

    const result = await fetchSyllabusById(7)

    expect(mockedHttp.get).toHaveBeenCalledWith('/syllabuses/7')
    expect(result).toEqual(entity)
  })

  it('createSyllabus POSTs the form (no centerId) to /syllabuses', async () => {
    const form: SyllabusForm = { name: 'JS', subjectId: 2, description: 'Intro' }
    const created = { id: 9, name: 'JS' }
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createSyllabus(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/syllabuses', form)
    expect(result).toEqual(created)
  })

  it('updateSyllabus PUTs the form to /syllabuses/{id}', async () => {
    const form: SyllabusForm = { name: 'JS v2' }
    const updated = { id: 5, name: 'JS v2' }
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateSyllabus(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/syllabuses/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteSyllabus DELETEs /syllabuses/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteSyllabus(4)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/syllabuses/4')
  })

  it('createTopic POSTs the body to /syllabuses/{id}/topics', async () => {
    const form: TopicForm = { title: 'Loops', difficulty: TopicDifficulty.MEDIUM, estimatedLessons: 2 }
    const topic = { id: 11, title: 'Loops' }
    mockedHttp.post.mockResolvedValueOnce({ data: topic })

    const result = await createTopic(6, form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/syllabuses/6/topics', form)
    expect(result).toEqual(topic)
  })

  it('updateTopic PUTs the body to /syllabuses/{id}/topics/{topicId}', async () => {
    const form: TopicForm = { title: 'Arrays', difficulty: TopicDifficulty.HARD }
    const topic = { id: 12, title: 'Arrays' }
    mockedHttp.put.mockResolvedValueOnce({ data: topic })

    const result = await updateTopic(6, 12, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/syllabuses/6/topics/12', form)
    expect(result).toEqual(topic)
  })

  it('deleteTopic DELETEs /syllabuses/{id}/topics/{topicId}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteTopic(6, 12)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/syllabuses/6/topics/12')
  })

  it('reorderTopics PUTs { topicIds } to /syllabuses/{id}/topics/reorder', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await reorderTopics(6, [3, 1, 2])

    expect(mockedHttp.put).toHaveBeenCalledWith('/syllabuses/6/topics/reorder', { topicIds: [3, 1, 2] })
  })

  it('generateTopicContent POSTs the payload to the generate-content path', async () => {
    const payload = { audience: 'beginners', instructions: 'short' }
    const content = { guide: 'g', lessonOutline: 'o', homework: 'h' }
    mockedHttp.post.mockResolvedValueOnce({ data: content })

    const result = await generateTopicContent(6, 12, payload)

    expect(mockedHttp.post).toHaveBeenCalledWith(
      '/syllabuses/6/topics/12/generate-content',
      payload,
    )
    expect(result).toEqual(content)
  })

  it('aiChat POSTs the messages to /syllabuses/ai/chat and returns the response', async () => {
    const payload = {
      subjectId: 2,
      messages: [{ role: ChatRole.USER, content: 'Make a JS plan' }],
    }
    const response = { type: AiResponseType.QUESTION, message: 'How many lessons?' }
    mockedHttp.post.mockResolvedValueOnce({ data: response })

    const result = await aiChat(payload)

    expect(mockedHttp.post).toHaveBeenCalledWith('/syllabuses/ai/chat', payload)
    expect(result).toEqual(response)
  })

  it('aiSavePlan POSTs the plan to /syllabuses/ai/save and returns the created syllabus', async () => {
    const payload = {
      subjectId: 2,
      name: 'JS',
      description: 'Intro',
      topics: [{ title: 'Vars', difficulty: TopicDifficulty.EASY, estimatedLessons: 1 }],
    }
    const created = { id: 20, name: 'JS' }
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await aiSavePlan(payload)

    expect(mockedHttp.post).toHaveBeenCalledWith('/syllabuses/ai/save', payload)
    expect(result).toEqual(created)
  })
})
