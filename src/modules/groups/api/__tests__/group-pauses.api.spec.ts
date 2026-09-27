import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGroupPauses, createGroupPause, deleteGroupPause } from '../group-pauses.api'
import { http } from '@/shared/api/http'
import type { GroupPause, GroupPauseForm } from '../../interfaces/group-pause.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makePause(overrides: Partial<GroupPause> = {}): GroupPause {
  return {
    id: 3,
    groupId: 12,
    fromDate: '2026-10-01',
    toDate: '2026-10-10',
    reason: "Ustoz ta'tilda",
    createdAt: '2026-09-27T10:00:00Z',
    ...overrides,
  }
}

describe('group-pauses.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchGroupPauses GETs /groups/{id}/pauses and returns the array', async () => {
    const pauses = [makePause()]
    mockedHttp.get.mockResolvedValueOnce({ data: pauses })

    const result = await fetchGroupPauses(12)

    expect(mockedHttp.get).toHaveBeenCalledWith('/groups/12/pauses')
    expect(result).toEqual(pauses)
  })

  it('fetchGroupPauses returns [] when the body is not an array', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: { data: [] } })
    expect(await fetchGroupPauses(12)).toEqual([])

    mockedHttp.get.mockResolvedValueOnce({ data: null })
    expect(await fetchGroupPauses(12)).toEqual([])
  })

  it('createGroupPause POSTs the form and returns the created pause', async () => {
    const form: GroupPauseForm = { fromDate: '2026-10-01', toDate: '2026-10-10', reason: 'Bayram' }
    const created = makePause({ reason: 'Bayram' })
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createGroupPause(12, form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/groups/12/pauses', form)
    expect(result).toEqual(created)
  })

  it('deleteGroupPause DELETEs /groups/{id}/pauses/{pauseId}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    const result = await deleteGroupPause(12, 3)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/groups/12/pauses/3')
    expect(result).toBeUndefined()
  })
})
