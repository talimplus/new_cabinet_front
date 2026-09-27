import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HolidaysTable from '../HolidaysTable.vue'
import { t } from '@/locales'
import { formatDate } from '@/shared/utils/format-date'
import type { Holiday } from '../../interfaces/holiday.interface'

function makeHoliday(overrides: Partial<Holiday> = {}): Holiday {
  return {
    id: 1, centerId: null, fromDate: '2026-03-21', toDate: '2026-03-23', name: "Navro'z",
    createdAt: '2026-01-01T00:00:00.000Z', ...overrides,
  }
}

const centerLabel = (id: number | null): string => (id === null ? t('holidays.allCenters') : `Markaz ${id}`)

function mountTable(rows: Holiday[], canManage = false) {
  return mount(HolidaysTable, { props: { rows, canManage, centerLabel } })
}

// UiTable renders each row twice (desktop table + mobile card) — counts are scoped to `tbody`.
describe('HolidaysTable', () => {
  it('renders the column headers and the empty text', () => {
    const wrapper = mountTable([])
    expect(wrapper.text()).toContain(t('holidays.table.name'))
    expect(wrapper.text()).toContain(t('holidays.table.dates'))
    expect(wrapper.text()).toContain(t('holidays.table.center'))
    expect(wrapper.text()).toContain(t('holidays.empty'))
  })

  it('renders name, the formatted range and the number of days', () => {
    const tbody = mountTable([makeHoliday()]).get('tbody')
    expect(tbody.text()).toContain("Navro'z")
    expect(tbody.text()).toContain(`${formatDate('2026-03-21')} – ${formatDate('2026-03-23')}`)
    expect(tbody.text()).toContain(t('holidays.days', { count: 3 }))
  })

  it('shows a single date and 1 day for a one-day holiday', () => {
    const tbody = mountTable([makeHoliday({ fromDate: '2026-09-01', toDate: '2026-09-01' })]).get('tbody')
    expect(tbody.text()).toContain(formatDate('2026-09-01'))
    expect(tbody.text()).not.toContain('–')
    expect(tbody.text()).toContain(t('holidays.days', { count: 1 }))
  })

  it('labels the center via centerLabel', () => {
    const tbody = mountTable([makeHoliday({ id: 1 }), makeHoliday({ id: 2, centerId: 4 })]).get('tbody')
    expect(tbody.findAll('tr')).toHaveLength(2)
    expect(tbody.text()).toContain(t('holidays.allCenters'))
    expect(tbody.text()).toContain('Markaz 4')
  })

  it('hides the delete button without canManage', () => {
    const tbody = mountTable([makeHoliday()]).get('tbody')
    expect(tbody.find(`button[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
  })

  it('emits delete with the row when canManage', async () => {
    const row = makeHoliday({ id: 7 })
    const wrapper = mountTable([row], true)
    const buttons = wrapper.get('tbody').findAll(`button[aria-label="${t('common.delete')}"]`)
    expect(buttons).toHaveLength(1)
    await buttons[0]!.trigger('click')
    expect(wrapper.emitted('delete')).toEqual([[row]])
  })
})
