import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import GroupsTable from '../GroupsTable.vue'
import { GroupStatus } from '../../enums/group-status.enum'
import type { Group } from '../../interfaces/group.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

function makeGroup(overrides: Partial<Group> = {}): Group {
  return {
    id: 1,
    name: 'A1 guruh',
    monthlyFee: '400000',
    status: GroupStatus.STARTED,
    schedules: [],
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    ...overrides,
  }
}

function mountTable(rows: Group[], extra: Record<string, unknown> = {}) {
  return mount(GroupsTable, {
    props: { rows, canEdit: true, canDelete: true, canChangeStatus: true, ...extra },
  })
}

describe('GroupsTable', () => {
  it('formats a string monthlyFee through Number coercion', () => {
    const wrapper = mountTable([makeGroup({ monthlyFee: '400000' })])
    expect(wrapper.get('tbody').text()).toContain(formatSom(400000))
  })

  it('shows a no-end-date warning badge when the row has no endDate', () => {
    const wrapper = mountTable([makeGroup({ endDate: null })])
    expect(wrapper.get('tbody').text()).toContain(t('groups.noEndDate'))
  })

  it('does not show the no-end-date badge when endDate is set', () => {
    const wrapper = mountTable([makeGroup({ endDate: '2026-12-31' })])
    expect(wrapper.get('tbody').text()).not.toContain(t('groups.noEndDate'))
  })

  it('renders an upcoming-fee note when upcomingMonthlyFee is set', () => {
    const wrapper = mountTable([
      makeGroup({ upcomingMonthlyFee: 500000, upcomingFeeFromMonth: '2026-10-01' }),
    ])
    expect(wrapper.get('tbody').text()).toContain(
      t('groups.table.upcomingFee', { date: '01.10.2026', fee: formatSom(500000) }),
    )
  })

  it('does not render the upcoming-fee note when upcomingMonthlyFee is null', () => {
    const wrapper = mountTable([makeGroup({ upcomingMonthlyFee: null })])
    // The upcoming-fee note is the table's only <p> tag — absent means it did not render.
    expect(wrapper.get('tbody').findAll('p')).toHaveLength(0)
  })

  it('emits detail/edit/delete with the row when the icon buttons are clicked', async () => {
    const row = makeGroup({ id: 9 })
    const wrapper = mountTable([row])
    const tbody = wrapper.get('tbody')

    await tbody.get(`[aria-label="${t('common.view')}"]`).trigger('click')
    expect(wrapper.emitted('detail')?.[0]).toEqual([row])

    await tbody.get(`[aria-label="${t('common.edit')}"]`).trigger('click')
    expect(wrapper.emitted('edit')?.[0]).toEqual([row])

    await tbody.get(`[aria-label="${t('common.delete')}"]`).trigger('click')
    expect(wrapper.emitted('delete')?.[0]).toEqual([row])
  })

  it('hides the edit and delete buttons when canEdit/canDelete are false', () => {
    const wrapper = mountTable([makeGroup()], { canEdit: false, canDelete: false })
    const tbody = wrapper.get('tbody')
    expect(tbody.find(`[aria-label="${t('common.edit')}"]`).exists()).toBe(false)
    expect(tbody.find(`[aria-label="${t('common.delete')}"]`).exists()).toBe(false)
    // The view button always stays.
    expect(tbody.find(`[aria-label="${t('common.view')}"]`).exists()).toBe(true)
  })
})
