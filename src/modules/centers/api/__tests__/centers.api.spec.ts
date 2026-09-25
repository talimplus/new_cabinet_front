import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  fetchAllCenters,
  fetchCenters,
  createCenter,
  updateCenter,
  deleteCenter,
  captureCenterIp,
} from '../centers.api'
import { http } from '@/shared/api/http'
import type { Center } from '../../interfaces/center.interface'

// Mock the shared axios instance — API tests never hit the network.
vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

describe('centers.api', () => {
  beforeEach(() => vi.clearAllMocks())

  it('fetchAllCenters GETs /centers/all and returns the parsed body', async () => {
    const centers: Center[] = [
      { id: 1, name: 'Markaz 1', isDefault: true },
      { id: 2, name: 'Markaz 2' },
    ]
    mockedHttp.get.mockResolvedValueOnce({ data: centers })

    const result = await fetchAllCenters()

    expect(mockedHttp.get).toHaveBeenCalledWith('/centers/all')
    expect(result).toEqual(centers)
  })

  it('fetchCenters GETs /centers with params and returns the paginated body', async () => {
    const body = { data: [{ id: 1, name: 'Markaz 1' }], meta: { total: 1, page: 1 } }
    mockedHttp.get.mockResolvedValueOnce({ data: body })

    const result = await fetchCenters({ name: 'Mark', page: 1, perPage: 20 })

    expect(mockedHttp.get).toHaveBeenCalledWith('/centers', {
      params: { name: 'Mark', page: 1, perPage: 20 },
    })
    expect(result).toEqual(body)
  })

  it('createCenter POSTs the form to /centers and returns the created center', async () => {
    const form = { name: 'Yangi markaz' }
    const created: Center = { id: 9, name: 'Yangi markaz' }
    mockedHttp.post.mockResolvedValueOnce({ data: created })

    const result = await createCenter(form)

    expect(mockedHttp.post).toHaveBeenCalledWith('/centers', form)
    expect(result).toEqual(created)
  })

  it('updateCenter PUTs the form to /centers/{id}', async () => {
    const form = { name: 'Tahrirlangan' }
    const updated: Center = { id: 3, name: 'Tahrirlangan' }
    mockedHttp.put.mockResolvedValueOnce({ data: updated })

    const result = await updateCenter(3, form)

    expect(mockedHttp.put).toHaveBeenCalledWith('/centers/3', form)
    expect(result).toEqual(updated)
  })

  it('deleteCenter DELETEs /centers/{id}', async () => {
    mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

    await deleteCenter(7)

    expect(mockedHttp.delete).toHaveBeenCalledWith('/centers/7')
  })

  it('captureCenterIp POSTs /centers/{id}/capture-ip and returns the parsed body', async () => {
    const body = { publicIp: '84.54.72.10' }
    mockedHttp.post.mockResolvedValueOnce({ data: body })

    const result = await captureCenterIp(4)

    expect(mockedHttp.post).toHaveBeenCalledWith(
      '/centers/4/capture-ip',
      undefined,
      expect.objectContaining({ skipGlobalError: true }),
    )
    expect(result).toEqual(body)
  })
})
