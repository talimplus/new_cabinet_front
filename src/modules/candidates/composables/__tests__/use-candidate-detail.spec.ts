import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCandidateDetail } from '../use-candidate-detail'
import { fetchCandidate as fetchCandidateApi, updateCandidate as updateCandidateApi } from '../../api/candidates.api'
import { fetchSubjects as fetchSubjectsApi } from '@/modules/subjects/api/subjects.api'
import type { Candidate } from '../../interfaces/candidate.interface'
import type { CandidateForm } from '../../interfaces/candidate-form.interface'
import type { Subject } from '@/modules/subjects/interfaces/subject.interface'

vi.mock('../../api/candidates.api', () => ({ fetchCandidate: vi.fn(), updateCandidate: vi.fn() }))
vi.mock('@/modules/subjects/api/subjects.api', () => ({ fetchSubjects: vi.fn() }))

const mockedFetch = vi.mocked(fetchCandidateApi)
const mockedUpdate = vi.mocked(updateCandidateApi)
const mockedSubjects = vi.mocked(fetchSubjectsApi)

const candidate = { id: 7, centerId: 5, firstName: 'Ali', lastName: 'Valiyev' } as Candidate
const form = { centerId: 5, firstName: 'Vali' } as CandidateForm

describe('useCandidateDetail', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    mockedSubjects.mockResolvedValue({
      data: [{ id: 2, name: 'Matematika' } as Subject],
      meta: { total: 1, page: 1, perPage: 100, totalPages: 1 },
    })
  })

  it('init loads the candidate by id and the subject options', async () => {
    mockedFetch.mockResolvedValueOnce(candidate)
    const d = useCandidateDetail(() => 7)
    await d.init()

    expect(mockedFetch).toHaveBeenCalledWith(7)
    expect(d.candidate.value).toEqual(candidate)
    expect(d.failed.value).toBe(false)
    expect(d.loading.value).toBe(false)
    expect(d.subjects.value).toEqual([{ label: 'Matematika', value: 2 }])
  })

  it('marks failed when the candidate cannot be loaded', async () => {
    mockedFetch.mockRejectedValueOnce(new Error('404'))
    const d = useCandidateDetail(() => 99)
    await d.load()

    expect(d.candidate.value).toBeNull()
    expect(d.failed.value).toBe(true)
  })

  it('submit updates, replaces the candidate with the response and closes the modal', async () => {
    mockedFetch.mockResolvedValueOnce(candidate)
    const updated = { ...candidate, firstName: 'Vali' }
    mockedUpdate.mockResolvedValueOnce(updated)
    const d = useCandidateDetail(() => 7)
    await d.load()
    d.modalOpen.value = true

    await d.submit(form)

    expect(mockedUpdate).toHaveBeenCalledWith(7, form)
    expect(d.candidate.value).toEqual(updated)
    expect(d.modalOpen.value).toBe(false)
  })
})
