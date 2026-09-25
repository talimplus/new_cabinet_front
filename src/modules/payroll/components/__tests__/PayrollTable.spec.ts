import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PayrollTable from '../PayrollTable.vue'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

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
  showCommission = false,
  extra: Partial<{ canPay: boolean; canViewStaff: boolean }> = {},
) {
  return mount(PayrollTable, {
    props: { rows, showCommission, canPay: true, canViewStaff: false, ...extra },
  })
}

describe('PayrollTable', () => {
  it('shows the commission column only when showCommission is set', () => {
    expect(mountTable([makeSalary()], false).text()).not.toContain('Ustama')
    expect(mountTable([makeSalary()], true).text()).toContain('Ustama')
  })

  it('applies the danger class to a positive remaining amount', () => {
    const unpaid = mountTable([makeSalary({ paidAmount: 500_000 })]) // remaining 1.5M > 0
    expect(unpaid.html()).toContain('text-danger')

    const settled = mountTable([makeSalary({ paidAmount: 2_000_000, status: PayrollStatus.PAID })])
    expect(settled.html()).not.toContain('text-danger')
  })

  it('renders a pay button for unpaid rows and a paid label when fully paid', () => {
    const unpaid = mountTable([makeSalary({ status: PayrollStatus.UNPAID })])
    expect(unpaid.findComponent({ name: 'UiButton' }).exists()).toBe(true)
    expect(unpaid.text()).toContain(t('payroll.pay'))

    const paid = mountTable([makeSalary({ status: PayrollStatus.PAID })])
    expect(paid.findComponent({ name: 'UiButton' }).exists()).toBe(false)
    expect(paid.text()).toContain(t('payroll.paid'))
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

  describe('base-salary column', () => {
    it('uses the teacher base-salary snapshot when present, not the raw baseSalary', () => {
      const wrapper = mountTable([makeSalary({ baseSalary: 1_000_000, earningBaseSalarySnapshot: 1_500_000 })])
      const cell = wrapper.get('tbody tr').findAll('td')[2]!.text()
      expect(cell).toContain(formatSom(1_500_000))
    })
  })

  describe('deduction column (PayrollDeductionCell)', () => {
    it('shows the withheld amount in text-danger when positive', () => {
      const wrapper = mountTable([makeSalary({ deductionAmount: 200_000 })])
      const cell = wrapper.get('tbody tr').findAll('td')[4]!
      expect(cell.text()).toContain(`−${formatSom(200_000)}`)
      expect(cell.html()).toContain('text-danger')
    })

    it('shows a dash when there is no deduction', () => {
      const wrapper = mountTable([makeSalary({ deductionAmount: 0 })])
      const cell = wrapper.get('tbody tr').findAll('td')[4]!
      expect(cell.text()).toBe('—')
    })

    it('shows the outstanding line only when deductionOutstanding is positive', () => {
      const withOutstanding = mountTable([
        makeSalary({ deductionAmount: 100_000, deductionOutstanding: 50_000 }),
      ])
      expect(withOutstanding.get('tbody tr').findAll('td')[4]!.text()).toContain(
        t('payroll.table.outstanding', { amount: formatSom(50_000) }),
      )

      const withoutOutstanding = mountTable([
        makeSalary({ deductionAmount: 100_000, deductionOutstanding: 0 }),
      ])
      expect(withoutOutstanding.get('tbody tr').findAll('td')[4]!.text()).not.toContain(
        t('payroll.table.outstanding', { amount: formatSom(50_000) }),
      )
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
    it('shows the eye button only with canViewStaff and emits open-staff with the row', async () => {
      const row = makeSalary({ id: 5 })
      const hidden = mountTable([row], false, { canViewStaff: false })
      expect(hidden.get('tbody').find(`[aria-label="${t('staff.viewAction')}"]`).exists()).toBe(false)

      const shown = mountTable([row], false, { canViewStaff: true })
      const eyeButton = shown.get('tbody').get(`[aria-label="${t('staff.viewAction')}"]`)
      await eyeButton.trigger('click')
      expect(shown.emitted('open-staff')?.[0]).toEqual([row])
    })

    it('shows the pay button only with canPay and a non-PAID status', () => {
      const noPermission = mountTable([makeSalary({ status: PayrollStatus.UNPAID })], false, {
        canPay: false,
      })
      expect(noPermission.get('tbody').text()).not.toContain(t('payroll.pay'))
      expect(noPermission.get('tbody').text()).not.toContain(t('payroll.paid'))

      const canPayRow = mountTable([makeSalary({ status: PayrollStatus.UNPAID })], false, { canPay: true })
      expect(canPayRow.get('tbody').text()).toContain(t('payroll.pay'))

      const paidRow = mountTable([makeSalary({ status: PayrollStatus.PAID })], false, { canPay: true })
      expect(paidRow.get('tbody').text()).not.toContain(t('payroll.pay'))
      expect(paidRow.get('tbody').text()).toContain(t('payroll.paid'))
    })
  })
})
