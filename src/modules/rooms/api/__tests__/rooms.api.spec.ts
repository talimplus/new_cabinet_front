import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '../rooms.api'
import { http } from '@/shared/api/http'
import type { Room } from '../../interfaces/room.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('rooms.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchRooms GETs /rooms with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: '101' }], meta: { total: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchRooms({ centerId: 2 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/rooms', { params: { centerId: 2 } })
    expect(result).toEqual(body)
  })

  it('createRoom POSTs the form to /rooms and returns the created room', async () => {
    const form = { centerId: 2, name: '202' }
    const created: Room = { id: 5, name: '202' }
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createRoom(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/rooms', form)
    expect(result).toEqual(created)
  })

  it('updateRoom PUTs the form to /rooms/{id}', async () => {
    const form = { centerId: 2, name: '303' }
    const updated: Room = { id: 8, name: '303' }
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateRoom(8, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/rooms/8', form)
    expect(result).toEqual(updated)
  })

  it('deleteRoom DELETEs /rooms/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteRoom(4)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/rooms/4')
  })
})
