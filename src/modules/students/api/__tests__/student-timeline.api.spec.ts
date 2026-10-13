import { describe, it, expect, vi, beforeEach } from 'vitest'
import { http } from '@/shared/api/http'
import { fetchStudentTimeline } from '../student-timeline.api'
import { StudentTimelineCategory, StudentTimelineType } from '../../enums/student-timeline.enum'
import type { StudentTimelineItem } from '../../interfaces/student-timeline.interface'
import type { AxiosInstance } from 'axios'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn<AxiosInstance['get']>() },
}))

const mockedHttp = vi.mocked(http, true)

const item: StudentTimelineItem = {
  id: 'attendance:9',
  type: StudentTimelineType.ATTENDANCE,
  category: StudentTimelineCategory.ATTENDANCE,
  occurredAt: '2026-09-14',
  dateOnly: true,
  actor: { id: 61, name: 'Teacher X' },
  group: { id: 160, name: 'Feruza-2' },
  details: { status: 'absent', comment: null },
}

describe('student-timeline.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('GETs /students/{id}/timeline and returns the items', async () => {
    mockedHttp.get.mockResolvedValueOnce({ data: { items: [item] } })
    const result = await fetchStudentTimeline(42)
    expect(mockedHttp.get).toHaveBeenCalledWith('/students/42/timeline')
    expect(result).toEqual({ items: [item] })
  })

  it.each([
    ['missing items', {}],
    ['null items', { items: null }],
    ['object items', { items: { a: 1 } }],
    ['null body', null],
  ])('falls back to [] for %s', async (_label, body) => {
    mockedHttp.get.mockResolvedValueOnce({ data: body })
    expect(await fetchStudentTimeline(1)).toEqual({ items: [] })
  })

  it('propagates request failures', async () => {
    mockedHttp.get.mockRejectedValueOnce(new Error('boom'))
    await expect(fetchStudentTimeline(1)).rejects.toThrow('boom')
  })
})
