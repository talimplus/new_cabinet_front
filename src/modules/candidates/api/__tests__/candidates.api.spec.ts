import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCandidates, createCandidate, updateCandidate, deleteCandidate } from '../candidates.api'
import { http } from '@/shared/api/http'
import type { Candidate } from '../../interfaces/candidate.interface'
import type { CandidateForm } from '../../interfaces/candidate-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: CandidateForm = {
  centerId: 1,
  lastName: 'Valiyev',
  firstName: 'Ali',
  phone: '+998977522014',
  experience: '3 yil',
  birthYear: 1995,
  subjectId: 2,
  address: null,
  comment: null,
}

describe('candidates.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchCandidates GETs /candidates with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, firstName: 'Ali' }], meta: { total: 1, page: 1, totalPages: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchCandidates({ search: 'ali', subjectId: 2, page: 1, perPage: 20 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/candidates', {
      params: { search: 'ali', subjectId: 2, page: 1, perPage: 20 },
    })
    expect(result).toEqual(body)
  })

  it('createCandidate POSTs the form to /candidates and returns the created candidate', async () => {
    const created = { id: 10, firstName: 'Ali' } as Candidate
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createCandidate(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/candidates', form)
    expect(result).toEqual(created)
  })

  it('updateCandidate PUTs the form to /candidates/{id} and returns the updated candidate', async () => {
    const updated = { id: 5, firstName: 'Ali' } as Candidate
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateCandidate(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/candidates/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteCandidate DELETEs /candidates/{id} and resolves to undefined', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    const result = await deleteCandidate(8)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/candidates/8')
    expect(result).toBeUndefined()
  })
})
