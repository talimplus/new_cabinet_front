import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchGroups, fetchGroupById, createGroup, updateGroup, deleteGroup, changeGroupStatus } from '../groups.api'
import { http } from '@/shared/api/http'
import { GroupStatus } from '../../enums/group-status.enum'
import { WeekDay } from '../../enums/week-day.enum'
import type { Group } from '../../interfaces/group.interface'
import type { GroupForm } from '../../interfaces/group-form.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

const form: GroupForm = {
  name: 'A1',
  centerId: 1,
  subjectId: 2,
  teacherId: 3,
  roomId: 4,
  monthlyFee: 500000,
  lessonDurationMinutes: 90,
  days: [{ day: WeekDay.MONDAY, startTime: '10:00' }],
}

describe('groups.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchGroups GETs /groups with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'A1' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchGroups({ centerId: 1, page: 1, perPage: 20 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/groups', {
      params: { centerId: 1, page: 1, perPage: 20 },
    })
    expect(result).toEqual(body)
  })

  it('fetchGroupById GETs /groups/{id} and returns the group body', async () => {
    const group = { id: 12, name: 'A1' } as Group
    mockedHttp.get.mockResolvedValueOnce({ data: group })

    const result = await fetchGroupById(12)

    expect(mockedHttp.get).toHaveBeenCalledWith('/groups/12')
    expect(result).toEqual(group)
  })

  it('createGroup POSTs the form to /groups and returns the created group', async () => {
    const created = { id: 10, name: 'A1' } as Group
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createGroup(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/groups', form)
    expect(result).toEqual(created)
  })

  it('updateGroup PUTs the form to /groups/{id}', async () => {
    const updated = { id: 5, name: 'A1' } as Group
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateGroup(5, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/groups/5', form)
    expect(result).toEqual(updated)
  })

  it('deleteGroup DELETEs /groups/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteGroup(7)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/groups/7')
  })

  it('changeGroupStatus PUTs /groups/change-status/{id} with the status body', async () => {
    mockedHttp.put.mockResolvedValueOnce({ data: undefined })

    await changeGroupStatus(3, GroupStatus.STARTED)

    expect(mockedHttp.put).toHaveBeenCalledWith('/groups/change-status/3', {
      status: GroupStatus.STARTED,
    })
  })
})
