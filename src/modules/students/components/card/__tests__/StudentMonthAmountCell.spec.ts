import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentMonthAmountCell from '../StudentMonthAmountCell.vue'
import { PaymentStatus } from '@/modules/payments/enums/payment-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { StudentSummaryMonth } from '../../../interfaces/student-summary.interface'

function makeMonth(overrides: Partial<StudentSummaryMonth> = {}): StudentSummaryMonth {
  return {
    paymentId: 1,
    forMonth: '2026-09',
    groupId: 1,
    groupName: 'Group A',
    amountDue: 400000,
    amountPaid: 400000,
    pendingAmount: 0,
    receivedAmount: 400000,
    remaining: 0,
    payableNow: 0,
    status: PaymentStatus.PAID,
    ...overrides,
  }
}

function mountCell(month: Partial<StudentSummaryMonth> = {}) {
  return mount(StudentMonthAmountCell, { props: { month: makeMonth(month) } })
}

describe('StudentMonthAmountCell', () => {
  it('shows the struck-through full amount and lessons fragment when prorated', () => {
    const wrapper = mountCell({
      isProrated: true,
      fullAmount: 500000,
      amountDue: 400000,
      lessonsBillable: 8,
      lessonsPlanned: 10,
    })
    const strike = wrapper.find('.line-through')
    expect(strike.exists()).toBe(true)
    expect(strike.text()).toBe(formatSom(500000))
    expect(wrapper.text()).toContain(formatSom(400000))
    expect(wrapper.text()).toContain(t('students.view.table.lessonsShort', { billable: 8, planned: 10 }))
  })

  it('shows neither the struck-through amount nor the lessons fragment when not prorated', () => {
    const wrapper = mountCell({ isProrated: false, fullAmount: 500000, lessonsPlanned: 10 })
    expect(wrapper.find('.line-through').exists()).toBe(false)
    expect(wrapper.text()).not.toContain(t('students.view.table.lessonsShort', { billable: 0, planned: 10 }))
  })

  it('shows nothing prorated when isProrated is true but fullAmount is missing', () => {
    const wrapper = mountCell({ isProrated: true, fullAmount: undefined })
    expect(wrapper.find('.line-through').exists()).toBe(false)
  })

  it('shows the excused line only when lessonsExcused > 0', () => {
    expect(mountCell({ lessonsExcused: 2 }).text()).toContain(
      t('students.view.table.excused', { count: 2 }),
    )
    expect(mountCell({ lessonsExcused: 0 }).text()).not.toContain(
      t('students.view.table.excused', { count: 0 }),
    )
  })

  it('shows the excluded line only when manualExcludedAmount > 0, with reason in parens', () => {
    const withReason = mountCell({ manualExcludedAmount: 15000, manualExcludedReason: 'Kasal' })
    expect(withReason.text()).toContain(
      t('students.view.table.excluded', { amount: formatSom(15000) }),
    )
    expect(withReason.text()).toContain('(Kasal)')

    const noReason = mountCell({ manualExcludedAmount: 15000 })
    expect(noReason.text()).not.toContain('(')

    const zero = mountCell({ manualExcludedAmount: 0 })
    expect(zero.text()).not.toContain(t('students.view.table.excluded', { amount: formatSom(0) }))
  })

  describe('discount line', () => {
    it('shows the discount percent', () => {
      expect(mountCell({ discountPercent: 10 }).text()).toContain(
        t('students.view.table.discount', { value: '10%' }),
      )
    })

    it('shows the fixed discount amount', () => {
      expect(mountCell({ discountAmount: 50000 }).text()).toContain(
        t('students.view.table.discount', { value: formatSom(50000) }),
      )
    })

    it('joins percent and amount when both apply', () => {
      expect(mountCell({ discountPercent: 10, discountAmount: 50000 }).text()).toContain(
        t('students.view.table.discount', { value: `10% · ${formatSom(50000)}` }),
      )
    })

    it('is hidden when both are 0 or undefined', () => {
      expect(mountCell().find('p.text-info').exists()).toBe(false)
      expect(mountCell({ discountPercent: 0, discountAmount: 0 }).find('p.text-info').exists()).toBe(false)
    })
  })
})
