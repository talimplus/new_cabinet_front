import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { flushPromises } from '@vue/test-utils'
import { useHolidays } from '../use-holidays'
import { fetchHolidays, createHoliday, deleteHoliday } from '../../api/holidays.api'
import { useScopeStore } from '@/stores/scope.store'
import { useUserStore } from '@/stores/user.store'
import { useNotificationStore } from '@/stores/notification.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { t } from '@/locales'
import type { Holiday } from '../../interfaces/holiday.interface'
import type { Center } from '@/modules/centers/interfaces/center.interface'

vi.mock('../../api/holidays.api', () => ({
  fetchHolidays: vi.fn(),
  createHoliday: vi.fn(),
  deleteHoliday: vi.fn(),
}))
vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn(),
}))

const mockedFetch = vi.mocked(fetchHolidays)
const mockedCreate = vi.mocked(createHoliday)
const mockedDelete = vi.mocked(deleteHoliday)

const CENTERS: Center[] = [
  { id: 1, name: 'Markaz 1', isDefault: true },
  { id: 2, name: 'Markaz 2' },
]

function makeHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    id: 1, centerId: null, fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z",
    createdAt: '2026-01-01T00:00:00.000Z', ...overrides,
  }
}

function signIn(role: UserRole): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role, roleId: 1, roleName: 'Test', centerId: 1, permissions: [ALL_PERMISSIONS],
  }
}

function fillValid(h: ReturnType<typeof useHolidays>): void {
  h.setField({ fromDate: new Date(2026, 2, 21), toDate: new Date(2026, 2, 23), name: "  Navro'z  " })
}

describe('useHolidays', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 8, 27))
    mockedFetch.mockResolvedValue([makeHoliday()])
    mockedCreate.mockResolvedValue(makeHoliday({ id: 2 }))
    mockedDelete.mockResolvedValue(undefined)
    signIn(UserRole.RECEPTION)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('load passes the current year and fills rows', async () => {
    const h = useHolidays()
    const pending = h.load()
    expect(h.loading.value).toBe(true)
    await pending

    expect(mockedFetch).toHaveBeenCalledWith({ year: 2026 })
    expect(h.rows.value).toEqual([makeHoliday()])
    expect(h.loading.value).toBe(false)
  })

  it('offers previous, current and next year', () => {
    expect(useHolidays().yearOptions.value).toEqual([
      { label: '2025', value: 2025 },
      { label: '2026', value: 2026 },
      { label: '2027', value: 2027 },
    ])
  })

  it('setYear updates the year and reloads', async () => {
    const h = useHolidays()
    h.setYear(2027)
    await flushPromises()

    expect(h.year.value).toBe(2027)
    expect(mockedFetch).toHaveBeenCalledWith({ year: 2027 })
  })

  it('openForm resets the form', () => {
    const h = useHolidays()
    h.setField({ name: 'x', onlyActiveCenter: true })
    h.form.errors = { name: 'err' }
    h.openForm()

    expect(h.form).toMatchObject({ open: true, fromDate: null, toDate: null, name: '', onlyActiveCenter: false, errors: {} })
  })

  describe('validation', () => {
    it('requires both dates and a non-blank name', async () => {
      const h = useHolidays()
      h.openForm()
      h.setField({ name: '   ' })
      await h.submit()

      expect(h.form.errors).toEqual({
        fromDate: t('holidays.validation.fromDate'),
        toDate: t('holidays.validation.toDate'),
        name: t('holidays.validation.name'),
      })
      expect(mockedCreate).not.toHaveBeenCalled()
      expect(h.form.open).toBe(true)
    })

    it('rejects a toDate before fromDate', async () => {
      const h = useHolidays()
      h.openForm()
      h.setField({ fromDate: new Date(2026, 2, 23), toDate: new Date(2026, 2, 21), name: 'X' })
      await h.submit()

      expect(h.form.errors).toEqual({ toDate: t('holidays.validation.range') })
      expect(mockedCreate).not.toHaveBeenCalled()
    })

    it('accepts a single-day holiday (fromDate === toDate)', async () => {
      const h = useHolidays()
      h.openForm()
      h.setField({ fromDate: new Date(2026, 8, 1), toDate: new Date(2026, 8, 1), name: 'Mustaqillik' })
      await h.submit()

      expect(mockedCreate).toHaveBeenCalledWith({
        fromDate: '2026-09-01', toDate: '2026-09-01', name: 'Mustaqillik', centerId: null,
      })
    })
  })

  describe('submit', () => {
    it('sends YYYY-MM-DD dates, trimmed name and centerId null by default', async () => {
      const h = useHolidays()
      h.openForm()
      fillValid(h)
      await h.submit()

      expect(mockedCreate).toHaveBeenCalledWith({
        fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z", centerId: null,
      })
      expect(useNotificationStore().items.map((n) => n.message)).toContain(t('holidays.messages.created'))
      expect(h.form.open).toBe(false)
      expect(h.form.saving).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('ignores onlyActiveCenter when the user cannot switch centers', async () => {
      const scope = useScopeStore()
      scope.centers = CENTERS
      scope.setActive(2)
      const h = useHolidays()
      expect(h.canScopeToCenter.value).toBe(false)
      h.openForm()
      fillValid(h)
      h.setField({ onlyActiveCenter: true })
      await h.submit()

      expect(mockedCreate.mock.calls[0]![0].centerId).toBeNull()
    })

    it('sends the active center when an admin picked one and ticked onlyActiveCenter', async () => {
      signIn(UserRole.ADMIN)
      const scope = useScopeStore()
      scope.centers = CENTERS
      scope.setActive(2)
      const h = useHolidays()
      expect(h.canScopeToCenter.value).toBe(true)
      expect(h.activeCenterName.value).toBe('Markaz 2')

      h.openForm()
      fillValid(h)
      h.setField({ onlyActiveCenter: true })
      await h.submit()

      expect(mockedCreate.mock.calls[0]![0].centerId).toBe(2)
    })

    it('keeps centerId null for an admin who did not tick onlyActiveCenter', async () => {
      signIn(UserRole.ADMIN)
      const scope = useScopeStore()
      scope.centers = CENTERS
      scope.setActive(2)
      const h = useHolidays()
      h.openForm()
      fillValid(h)
      await h.submit()

      expect(mockedCreate.mock.calls[0]![0].centerId).toBeNull()
    })

    it('cannot scope to a center when "All centers" is selected', () => {
      signIn(UserRole.ADMIN)
      useScopeStore().centers = CENTERS
      expect(useHolidays().canScopeToCenter.value).toBe(false)
    })

    it('maps a 422 into form.errors and keeps the form open', async () => {
      mockedCreate.mockRejectedValueOnce({
        response: { status: 422, data: { errors: { name: ['Band'], toDate: 'Xato' } } },
      })
      const h = useHolidays()
      h.openForm()
      fillValid(h)
      await h.submit()

      expect(h.form.errors).toEqual({ name: 'Band', toDate: 'Xato' })
      expect(h.form.open).toBe(true)
      expect(h.form.saving).toBe(false)
      expect(mockedFetch).not.toHaveBeenCalled()
    })
  })

  describe('closeForm', () => {
    it('closes the form', () => {
      const h = useHolidays()
      h.openForm()
      h.closeForm()
      expect(h.form.open).toBe(false)
    })

    it('is ignored while saving', () => {
      const h = useHolidays()
      h.openForm()
      h.form.saving = true
      h.closeForm()
      expect(h.form.open).toBe(true)
    })
  })

  describe('confirmDelete', () => {
    it('does nothing without a pending row', async () => {
      await useHolidays().confirmDelete()
      expect(mockedDelete).not.toHaveBeenCalled()
    })

    it('deletes the pending row, notifies, clears it and reloads', async () => {
      const h = useHolidays()
      h.pendingDelete.value = makeHoliday({ id: 5 })
      await h.confirmDelete()

      expect(mockedDelete).toHaveBeenCalledWith(5)
      expect(useNotificationStore().items.map((n) => n.message)).toContain(t('holidays.messages.deleted'))
      expect(h.pendingDelete.value).toBeNull()
      expect(h.deleting.value).toBe(false)
      expect(mockedFetch).toHaveBeenCalledTimes(1)
    })

    it('keeps the pending row and resets deleting when the request fails', async () => {
      mockedDelete.mockRejectedValueOnce(new Error('boom'))
      const h = useHolidays()
      h.pendingDelete.value = makeHoliday({ id: 5 })
      await expect(h.confirmDelete()).rejects.toThrow('boom')

      expect(h.pendingDelete.value).not.toBeNull()
      expect(h.deleting.value).toBe(false)
    })
  })

  describe('centerLabel', () => {
    it('null → all centers', () => {
      expect(useHolidays().centerLabel(null)).toBe(t('holidays.allCenters'))
    })

    it('a known id → its name, unknown → #id', () => {
      useScopeStore().centers = CENTERS
      const h = useHolidays()
      expect(h.centerLabel(2)).toBe('Markaz 2')
      expect(h.centerLabel(99)).toBe('#99')
    })
  })
})
