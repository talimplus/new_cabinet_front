import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchHolidays, createHoliday, deleteHoliday } from '../holidays.api'
import { http } from '@/shared/api/http'
import type { Holiday, HolidayForm } from '../../interfaces/holiday.interface'

vi.mock('@/shared/api/http', () => ({
  http: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

const mockedHttp = vi.mocked(http, true)

function makeHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    id: 1,
    centerId: null,
    fromDate: '2026-03-21',
    toDate: '2026-03-23',
    name: "Navro'z",
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

describe('holidays.api', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchHolidays', () => {
    it('GETs /holidays with the params and returns the array', async () => {
      const rows = [makeHoliday()]
      mockedHttp.get.mockResolvedValueOnce({ data: rows })

      const result = await fetchHolidays({ year: 2026 })

      expect(mockedHttp.get).toHaveBeenCalledWith('/holidays', { params: { year: 2026 } })
      expect(result).toEqual(rows)
    })

    it('passes undefined params when called without arguments', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: [] })
      await fetchHolidays()
      expect(mockedHttp.get).toHaveBeenCalledWith('/holidays', { params: undefined })
    })

    it('returns [] when the body is not an array', async () => {
      mockedHttp.get.mockResolvedValueOnce({ data: { data: [makeHoliday()] } })
      expect(await fetchHolidays({ year: 2026 })).toEqual([])

      mockedHttp.get.mockResolvedValueOnce({ data: null })
      expect(await fetchHolidays()).toEqual([])
    })
  })

  describe('createHoliday', () => {
    it('POSTs the form body to /holidays and returns the created holiday', async () => {
      const form: HolidayForm = { fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z", centerId: null }
      const created = makeHoliday({ id: 9 })
      mockedHttp.post.mockResolvedValueOnce({ data: created })

      const result = await createHoliday(form)

      expect(mockedHttp.post).toHaveBeenCalledWith('/holidays', form)
      expect(result).toEqual(created)
    })
  })

  describe('deleteHoliday', () => {
    it('DELETEs /holidays/{id}', async () => {
      mockedHttp.delete.mockResolvedValueOnce({ data: undefined })

      await expect(deleteHoliday(7)).resolves.toBeUndefined()
      expect(mockedHttp.delete).toHaveBeenCalledWith('/holidays/7')
    })
  })
})
