import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import { fetchGroupTimeline } from '../group-timeline.api'
import { GroupTimelineType } from '../../enums/group-timeline.enum'
import type { GroupTimelineEvent } from '../../interfaces/group-timeline.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn<(...args: unknown[]) => Promise<unknown>>() },
}))
const mockedHttp = vi.mocked(http, true)

describe('group-timeline.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GETs /groups/:id/timeline and returns the array body', async () => {
    const body: GroupTimelineEvent[] = [
      { date: '2026-10-01', type: GroupTimelineType.GROUP_CREATED, title: 'x', data: {} },
    ]
    mockedHttp.get.mockResolvedValueOnce({ data: body })
    const result = await fetchGroupTimeline(5)
    expect(mockedHttp.get).toHaveBeenCalledWith('/groups/5/timeline')
    expect(result).toEqual(body)
  })

  it('returns [] when the body is not an array', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: { data: [] } })
    expect(await fetchGroupTimeline(5)).toEqual([])
    mockedHttp.get.mockResolvedValueOnce({ data: null })
    expect(await fetchGroupTimeline(5)).toEqual([])
  })
})
