import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffSalaryCard from '../StaffSalaryCard.vue'
import { PayrollStatus } from '@/modules/payroll/enums/payroll-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import { t } from '@/locales'
import type { StaffOverviewSalary, AppliedDeduction } from '../../interfaces/staff-overview.interface'

function makeSalary(overrides: Partial<StaffOverviewSalary> = {}): StaffOverviewSalary {
  return {
    id: 1,
    forMonth: '2026-09',
    baseSalary: 2_000_000,
    deductionAmount: 0,
    netSalary: 2_000_000,
    paidAmount: 0,
    remaining: 2_000_000,
    status: PayrollStatus.UNPAID,
    appliedDeductions: [],
    ...overrides,
  }
}

function makeApplied(overrides: Partial<AppliedDeduction> = {}): AppliedDeduction {
  return { id: 1, deductionId: 1, amount: 30_000, reason: 'Kech qoldi', type: null, sourceForMonth: '2026-09', ...overrides }
}

function mountCard(props: Record<string, unknown> = {}) {
  return mount(StaffSalaryCard, { props: { salary: makeSalary(), outstanding: 0, ...props } })
}

describe('StaffSalaryCard', () => {
  it('shows base, withheld, net and remaining', () => {
    const wrapper = mountCard({
      salary: makeSalary({ baseSalary: 2_000_000, deductionAmount: 100_000, netSalary: 1_900_000, remaining: 1_900_000 }),
    })
    const text = wrapper.text()
    expect(text).toContain(formatSom(2_000_000))
    expect(text).toContain(formatSom(1_900_000))
  })

  it('prefixes the withheld amount with − and text-danger only when positive', () => {
    const withheld = mountCard({ salary: makeSalary({ deductionAmount: 100_000 }) })
    expect(withheld.text()).toContain(`−${formatSom(100_000)}`)
    expect(withheld.html()).toContain('text-danger')

    const none = mountCard({ salary: makeSalary({ deductionAmount: 0 }) })
    expect(none.text()).not.toContain('−')
  })

  it('renders one line per applied deduction', () => {
    const wrapper = mountCard({
      salary: makeSalary({
        appliedDeductions: [makeApplied({ id: 1, amount: 30_000, reason: 'Kech qoldi' }), makeApplied({ id: 2, amount: 20_000, reason: 'Boshqa' })],
      }),
    })
    expect(wrapper.text()).toContain(formatSom(30_000))
    expect(wrapper.text()).toContain('Kech qoldi')
    expect(wrapper.text()).toContain(formatSom(20_000))
    expect(wrapper.text()).toContain('Boshqa')
  })

  it('flags an applied slice whose sourceForMonth differs from the salary month', () => {
    const wrapper = mountCard({
      salary: makeSalary({
        forMonth: '2026-09',
        appliedDeductions: [makeApplied({ sourceForMonth: '2026-08' })],
      }),
    })
    expect(wrapper.text()).toContain(t('staff.salary.fromMonth', { month: formatMonth('2026-08') }))
  })

  it('does not flag an applied slice from the same month', () => {
    const wrapper = mountCard({
      salary: makeSalary({
        forMonth: '2026-09',
        appliedDeductions: [makeApplied({ sourceForMonth: '2026-09' })],
      }),
    })
    expect(wrapper.text()).not.toContain(t('staff.salary.fromMonth', { month: formatMonth('2026-09') }))
  })

  it('shows the outstanding warning only when outstanding > 0', () => {
    const withOutstanding = mountCard({ outstanding: 50_000 })
    expect(withOutstanding.text()).toContain(t('staff.salary.outstandingHint', { amount: formatSom(50_000) }))

    const withoutOutstanding = mountCard({ outstanding: 0 })
    expect(withoutOutstanding.text()).not.toContain(t('staff.salary.outstandingHint', { amount: formatSom(50_000) }))
  })

  it('shows the pay button only when showActions, canPay and remaining > 0', () => {
    expect(mountCard({ showActions: true, canPay: true, salary: makeSalary({ remaining: 100_000 }) }).text())
      .toContain(t('staff.salary.payButton'))
    expect(mountCard({ showActions: false, canPay: true, salary: makeSalary({ remaining: 100_000 }) }).text())
      .not.toContain(t('staff.salary.payButton'))
    expect(mountCard({ showActions: true, canPay: false, salary: makeSalary({ remaining: 100_000 }) }).text())
      .not.toContain(t('staff.salary.payButton'))
    expect(mountCard({ showActions: true, canPay: true, salary: makeSalary({ remaining: 0 }) }).text())
      .not.toContain(t('staff.salary.payButton'))
  })

  it('shows the fine button only when showActions and canDeduct', () => {
    expect(mountCard({ showActions: true, canDeduct: true }).text()).toContain(t('staff.deduction.addButton'))
    expect(mountCard({ showActions: false, canDeduct: true }).text()).not.toContain(t('staff.deduction.addButton'))
    expect(mountCard({ showActions: true, canDeduct: false }).text()).not.toContain(t('staff.deduction.addButton'))
  })

  it('emits pay and deduct from their buttons', async () => {
    const wrapper = mountCard({
      showActions: true,
      canPay: true,
      canDeduct: true,
      salary: makeSalary({ remaining: 100_000 }),
    })
    const buttons = wrapper.findAllComponents({ name: 'UiButton' })
    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')
    expect(wrapper.emitted('pay')).toHaveLength(1)
    expect(wrapper.emitted('deduct')).toHaveLength(1)
  })
})
