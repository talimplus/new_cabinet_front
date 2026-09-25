import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffDeductionsTable from '../StaffDeductionsTable.vue'
import { StaffDeductionType, DEDUCTION_TYPE_LABEL_KEYS } from '../../enums/staff-deduction-type.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StaffDeductionRow } from '../../interfaces/staff-overview.interface'

function makeRow(overrides: Partial<StaffDeductionRow> = {}): StaffDeductionRow {
  return {
    id: 1,
    userId: 10,
    amount: 100_000,
    appliedAmount: 40_000,
    remainingAmount: 60_000,
    type: StaffDeductionType.LATE,
    reason: 'Kech qoldi',
    sourceForMonth: '2026-09',
    settledAt: null,
    createdAt: '2026-09-01',
    createdBy: { id: 1, firstName: 'A', lastName: 'B' },
    ...overrides,
  }
}

function mountTable(rows: StaffDeductionRow[], extra: Record<string, unknown> = {}) {
  return mount(StaffDeductionsTable, { props: { rows, ...extra } })
}

describe('StaffDeductionsTable', () => {
  it('shows the amount in text-danger', () => {
    const wrapper = mountTable([makeRow({ amount: 100_000 })])
    const cell = wrapper.get('tbody tr').findAll('td')[1]!
    expect(cell.text()).toContain(formatSom(100_000))
    expect(cell.html()).toContain('text-danger')
  })

  it('shows the remaining warning amount when remainingAmount > 0', () => {
    const wrapper = mountTable([makeRow({ remainingAmount: 60_000 })])
    const cell = wrapper.get('tbody tr').findAll('td')[2]!
    expect(cell.text()).toContain(formatSom(60_000))
    expect(cell.text()).not.toContain(t('staff.deduction.settled'))
  })

  it('shows a "settled" badge when remainingAmount is 0', () => {
    const wrapper = mountTable([makeRow({ remainingAmount: 0 })])
    const cell = wrapper.get('tbody tr').findAll('td')[2]!
    expect(cell.text()).toContain(t('staff.deduction.settled'))
  })

  it('translates the type column through DEDUCTION_TYPE_LABEL_KEYS', () => {
    const wrapper = mountTable([makeRow({ type: StaffDeductionType.UNSETTLED_PAYMENT })])
    expect(wrapper.get('tbody').text()).toContain(t(DEDUCTION_TYPE_LABEL_KEYS[StaffDeductionType.UNSETTLED_PAYMENT]))
  })

  it('shows the delete button only with canDeduct, and emits remove with the row', async () => {
    const row = makeRow({ id: 9 })
    const hidden = mountTable([row], { canDeduct: false })
    expect(hidden.get('tbody').findAll('button')).toHaveLength(0)

    const shown = mountTable([row], { canDeduct: true })
    const buttons = shown.get('tbody').findAll('button')
    expect(buttons).toHaveLength(1)
    await buttons[0]!.trigger('click')
    expect(shown.emitted('remove')?.[0]).toEqual([row])
  })
})
