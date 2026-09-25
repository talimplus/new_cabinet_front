import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExpensesTable from '../ExpensesTable.vue'
import { formatSom } from '@/shared/utils/format-money'
import type { Expense } from '../../interfaces/expense.interface'
import { t } from '@/locales'

function makeExpense(overrides: Partial<Expense> = {}): Expense {
  return {
    id: 1,
    centerId: 5,
    name: 'Ijara',
    amount: 1500000,
    description: 'Ofis ijarasi',
    forMonth: '2026-09',
    createdAt: '2026-09-01T10:00:00.000Z',
    center: { id: 5, name: 'Markaz A' },
    ...overrides,
  }
}

describe('ExpensesTable', () => {
  it('renders a row with formatted money, month and center', () => {
    const wrapper = mount(ExpensesTable, { props: { rows: [makeExpense()], canEdit: true, canDelete: true } })
    const text = wrapper.text()

    expect(text).toContain('Ijara')
    expect(text).toContain(formatSom(1500000))
    expect(text).toContain('09.2026')
    expect(text).toContain('Markaz A')
  })

  it('coerces a string amount before formatting', () => {
    const wrapper = mount(ExpensesTable, { props: { rows: [makeExpense({ amount: '12345.00' })] } })
    expect(wrapper.text()).toContain(formatSom(12345))
  })

  it('renders the empty text when there are no rows', () => {
    const wrapper = mount(ExpensesTable, { props: { rows: [] } })
    expect(wrapper.text()).toContain(t('expenses.noExpensesForMonth'))
  })

  it('falls back to a dash when the center is missing', () => {
    const wrapper = mount(ExpensesTable, { props: { rows: [makeExpense({ center: undefined })] } })
    expect(wrapper.text()).toContain('—')
  })

  it('emits edit and delete with the row when the action buttons are clicked', async () => {
    const expense = makeExpense()
    const wrapper = mount(ExpensesTable, { props: { rows: [expense], canEdit: true, canDelete: true } })
    const buttons = wrapper.findAll('tbody button')

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('edit')?.[0]).toEqual([expense])
    expect(wrapper.emitted('delete')?.[0]).toEqual([expense])
  })
})
