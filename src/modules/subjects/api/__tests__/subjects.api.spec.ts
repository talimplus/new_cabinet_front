import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchSubjects, createSubject, updateSubject, deleteSubject } from '../subjects.api'
import { http } from '@/shared/api/http'
import type { Subject } from '../../interfaces/subject.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('subjects.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchSubjects GETs /subjects with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'Ingliz tili' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchSubjects({ centerId: 2, page: 1, perPage: 100 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/subjects', {
      params: { centerId: 2, page: 1, perPage: 100 },
    })
    expect(result).toEqual(body)
  })

  it('createSubject POSTs the form to /subjects and returns the created subject', async () => {
    const form = { centerId: 2, name: 'Matematika' }
    const created: Subject = { id: 3, name: 'Matematika' }
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createSubject(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/subjects', form)
    expect(result).toEqual(created)
  })

  it('updateSubject PUTs the form to /subjects/{id}', async () => {
    const form = { centerId: 2, name: 'Fizika' }
    const updated: Subject = { id: 6, name: 'Fizika' }
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateSubject(6, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/subjects/6', form)
    expect(result).toEqual(updated)
  })

  it('deleteSubject DELETEs /subjects/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteSubject(9)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/subjects/9')
  })
})
