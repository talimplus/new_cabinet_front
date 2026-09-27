import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import HolidaysView from '../HolidaysView.vue'
import { fetchHolidays } from '../../api/holidays.api'
import { useUserStore } from '@/stores/user.store'
import { Permission } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import { t } from '@/locales'
import type { Holiday } from '../../interfaces/holiday.interface'

vi.mock('../../api/holidays.api', () => ({
  fetchHolidays: vi.fn(),
  createHoliday: vi.fn(),
  deleteHoliday: vi.fn(),
}))
vi.mock('@/modules/centers/api/centers.api', () => ({
  fetchAllCenters: vi.fn(),
}))

function makeHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    id: 1, centerId: null, fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z",
    createdAt: '2026-01-01T00:00:00.000Z', ...overrides,
  }
}

function setUser(permissions: string[]): void {
  useUserStore().user = {
    id: 1, email: 'reception@test.uz', role: UserRole.RECEPTION, roleId: 3, roleName: 'Reception',
    centerId: 1, permissions,
  }
}

function addButton(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('button').find((b) => b.text() === t('common.add'))
}

describe('HolidaysView', () => {
  let pinia: Pinia

  beforeEach(() => {
    pinia = createPinia()
    setActivePinia(pinia)
    vi.mocked(fetchHolidays).mockResolvedValue([makeHoliday()])
  })

  afterEach(() => {
    vi.clearAllMocks()
    document.body.innerHTML = ''
  })

  it('loads on mount and renders the title and a row', async () => {
    setUser([Permission.SCHEDULE_VIEW])
    const wrapper = mount(HolidaysView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(fetchHolidays).toHaveBeenCalledTimes(1)
    expect(fetchHolidays).toHaveBeenCalledWith({ year: new Date().getFullYear() })
    expect(wrapper.text()).toContain(t('holidays.title'))
    expect(wrapper.get('tbody').text()).toContain("Navro'z")
  })

  it('hides the add button and delete actions without schedule.manage', async () => {
    setUser([Permission.SCHEDULE_VIEW])
    const wrapper = mount(HolidaysView, { global: { plugins: [pinia] } })
    await flushPromises()

    expect(addButton(wrapper)).toBeUndefined()
    expect(wrapper.get('tbody').find(`button[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
  })

  it('shows the add button with schedule.manage and opens the form', async () => {
    setUser([Permission.SCHEDULE_MANAGE])
    const wrapper = mount(HolidaysView, { global: { plugins: [pinia] }, attachTo: document.body })
    await flushPromises()

    const button = addButton(wrapper)
    expect(button).toBeDefined()
    expect(wrapper.get('tbody').find(`button[aria-label="${t('common.delete')}"]`).exists()).toBe(true)

    await button!.trigger('click')
    await flushPromises()
    expect(document.body.textContent).toContain(t('holidays.addTitle'))
  })
})
