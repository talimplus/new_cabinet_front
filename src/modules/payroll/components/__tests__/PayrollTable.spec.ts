import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PayrollTable from '../PayrollTable.vue'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'
import { t } from '@/locales'
import { formatMoney, formatSom } from '@/shared/utils/format-money'

function makeSalary(overrides: Partial<StaffSalary> = {}): StaffSalary {
  return {
    id: 1,
    userId: 10,
    forMonth: '2026-09',
    baseSalary: 2_000_000,
    paidAmount: 0,
    status: PayrollStatus.UNPAID,
    paidAt: null,
    comment: null,
    createdAt: '2026-01-01',
    user: {
      id: 10, firstName: 'Ali', lastName: 'Valiyev', login: 'ali', phone: '998',
      role: 'manager', salary: 2_000_000, commissionPercentage: null, createdAt: '2026-01-01',
    },
    ...overrides,
  }
}

function mountTable(
  rows: StaffSalary[],
  extra: Partial<{ canPay: boolean; canViewStaff: boolean }> = {},
) {
  return mount(PayrollTable, {
    props: { rows, canPay: true, canViewStaff: false, ...extra },
  })
}

describe('PayrollTable', () => {
  it('explains a teacher salary under "calculated": base + commission − transfer', () => {
    const wrapper = mountTable([
      makeSalary({
        baseSalary: 727_346,
        earningTotalEarning: 727_346,
        earningBaseSalarySnapshot: 0,
        earningCommissionGross: 862_346,
        transfersOut: [
          { id: 1, amount: 135_000, fromMonth: '2026-10-01', toMonth: '2026-11-01', student: null, group: null, paidAt: null, confirmedAt: null },
        ],
      }),
    ])
    const cell = wrapper.get('tbody tr').findAll('td')[2]!.text()
    expect(cell).toContain(formatSom(727_346))
    expect(cell).toContain(t('payroll.note.commission', { amount: formatMoney(862_346) }))
    expect(cell).toContain(t('payroll.note.out', { amount: formatMoney(135_000), month: t('common.months.11').toLowerCase() }))
  })

  it('applies the danger class to a positive remaining amount', () => {
    const unpaid = mountTable([makeSalary({ paidAmount: 500_000 })]) // remaining 1.5M > 0
    expect(unpaid.html()).toContain('text-danger')

    const settled = mountTable([makeSalary({ paidAmount: 2_000_000, status: PayrollStatus.PAID })])
    expect(settled.html()).not.toContain('text-danger')
  })

  it('renders a pay button while something is owed and none when settled', () => {
    const unpaid = mountTable([makeSalary({ status: PayrollStatus.UNPAID })])
    expect(unpaid.findComponent({ name: 'UiButton' }).exists()).toBe(true)
    expect(unpaid.text()).toContain(t('payroll.pay'))

    const paid = mountTable([makeSalary({ status: PayrollStatus.PAID, paidAmount: 2_000_000, remaining: 0 })])
    expect(paid.findComponent({ name: 'UiButton' }).exists()).toBe(false)
    expect(paid.text()).toContain(t('payroll.display.paid'))
  })

  it('emits pay with the row when the pay button is clicked', async () => {
    const row = makeSalary({ id: 77, status: PayrollStatus.UNPAID })
    const wrapper = mountTable([row])
    await wrapper.findComponent({ name: 'UiButton' }).trigger('click')
    expect(wrapper.emitted('pay')?.[0]).toEqual([row])
  })

  describe('role column', () => {
    it('shows the admin-defined role name when present', () => {
      const wrapper = mountTable([
        makeSalary({ user: { ...makeSalary().user, userRole: { id: 1, key: 'kassir', name: 'Kassir' } } }),
      ])
      const cell = wrapper.get('tbody tr').findAll('td')[1]!.text()
      expect(cell).toBe('Kassir')
    })

    it('falls back to the translated base role without an admin-defined name', () => {
      const wrapper = mountTable([
        makeSalary({ user: { ...makeSalary().user, role: 'manager', userRole: null } }),
      ])
      const cell = wrapper.get('tbody tr').findAll('td')[1]!.text()
      expect(cell).toBe(t('payroll.roles.manager'))
    })
  })

  describe('calculated column', () => {
    it('is the salary plus the bonus', () => {
      const wrapper = mountTable([makeSalary({ baseSalary: 1_000_000, bonusAmount: 200_000 })])
      const cell = wrapper.get('tbody tr').findAll('td')[2]!.text()
      expect(cell).toContain(formatSom(1_200_000))
    })
  })

  describe('advance and deduction columns', () => {
    it("shows the month's advance as given and the fine with a minus", () => {
      const wrapper = mountTable([makeSalary({ deductionAmount: 300_000, advanceAmount: 200_000, fineAmount: 100_000 })])
      const cells = wrapper.get('tbody tr').findAll('td')
      expect(cells[4]!.text()).toBe(formatSom(200_000))
      expect(cells[5]!.text()).toBe(`−${formatSom(100_000)}`)
    })

    it('shows a dash when no advance was given', () => {
      const wrapper = mountTable([makeSalary({ deductionAmount: 0 })])
      expect(wrapper.get('tbody tr').findAll('td')[4]!.text()).toBe('—')
    })

    it('warns when the advance exceeds the salary and offers to move it', async () => {
      const row = makeSalary({ advanceAmount: 1_000_000, deductionAmount: 1_000_000, baseSalary: 727_346, overAmount: 272_654, remaining: 0 })
      const wrapper = mountTable([row])
      const cell = wrapper.get('tbody tr').findAll('td')[4]!
      expect(cell.text()).toContain(t('payroll.over', { amount: formatSom(272_654) }))
      await cell.get('button').trigger('click')
      expect(wrapper.emitted('carry')?.[0]).toEqual([row])
      expect(wrapper.emitted('details')).toBeUndefined()
    })

    it('puts the advance debt under the name, not in a money column', () => {
      const withDebt = mountTable([makeSalary({ advanceOutstanding: 2_500 })])
      const first = withDebt.get('tbody tr').findAll('td')[0]!.text()
      expect(first).toContain(t('payroll.advanceDebt', { amount: formatSom(2_500) }))

      const without = mountTable([makeSalary({ advanceOutstanding: 0 })])
      expect(without.get('tbody tr').text()).not.toContain(t('payroll.advanceDebt', { amount: formatSom(2_500) }))
    })

    it('labels a salary covered only by an advance as "closed by advance"', () => {
      const wrapper = mountTable([
        makeSalary({ baseSalary: 500_000, deductionAmount: 500_000, advanceAmount: 500_000, remaining: 0, status: PayrollStatus.PAID }),
      ])
      expect(wrapper.text()).toContain(t('payroll.display.advance'))
    })
  })

  describe('row tint by status', () => {
    it('tints both the desktop row and the mobile card by status', () => {
      const unpaid = mountTable([makeSalary({ status: PayrollStatus.UNPAID })])
      expect(unpaid.get('tbody tr').classes().join(' ')).toContain('bg-danger-soft')
      expect(unpaid.get('article').classes().join(' ')).toContain('bg-danger-soft')

      const partial = mountTable([makeSalary({ status: PayrollStatus.PARTIAL, paidAmount: 100 })])
      expect(partial.get('tbody tr').classes().join(' ')).toContain('bg-warning-soft')
      expect(partial.get('article').classes().join(' ')).toContain('bg-warning-soft')

      const paid = mountTable([makeSalary({ status: PayrollStatus.PAID, paidAmount: 2_000_000 })])
      expect(paid.get('tbody tr').classes().join(' ')).toContain('bg-success-soft')
      expect(paid.get('article').classes().join(' ')).toContain('bg-success-soft')
    })
  })

  describe('row actions (PayrollRowActions)', () => {
    it('opens the salary breakdown on a row click', async () => {
      const row = makeSalary({ id: 5 })
      const wrapper = mountTable([row])
      await wrapper.get('tbody tr').trigger('click')
      expect(wrapper.emitted('details')?.[0]).toEqual([row])
      expect(wrapper.emitted('open-staff')).toBeUndefined()
    })

    it('shows the pay button only with canPay and something still owed', () => {
      const noPermission = mountTable([makeSalary({ status: PayrollStatus.UNPAID })], { canPay: false })
      expect(noPermission.get('tbody').text()).not.toContain(t('payroll.pay'))

      const canPayRow = mountTable([makeSalary({ status: PayrollStatus.UNPAID })], { canPay: true })
      expect(canPayRow.get('tbody').text()).toContain(t('payroll.pay'))

      const settled = mountTable([makeSalary({ status: PayrollStatus.PAID, paidAmount: 2_000_000, remaining: 0 })], { canPay: true })
      expect(settled.get('tbody').text()).not.toContain(t('payroll.pay'))
    })
  })
})
