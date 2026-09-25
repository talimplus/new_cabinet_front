import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StudentMonthsTable from '../StudentMonthsTable.vue'
import {
  PaymentStatus,
  PAYMENT_STATUS_LABEL_KEYS,
} from '@/modules/payments/enums/payment-status.enum'
import { formatMonth } from '@/shared/utils/format-month'
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

function mountTable(months: StudentSummaryMonth[]) {
  return mount(StudentMonthsTable, { props: { months } })
}

// UiTable renders each row twice (desktop table + mobile card), so element
// counts are scoped to `tbody` — the desktop rendering.
describe('StudentMonthsTable', () => {
  it('renders one row per month scoped to tbody', () => {
    const months = [makeMonth({ paymentId: 1 }), makeMonth({ paymentId: 2 })]
    expect(mountTable(months).findAll('tbody tr')).toHaveLength(2)
  })

  it('renders forMonth through formatMonth', () => {
    const text = mountTable([makeMonth({ forMonth: '2026-03' })]).get('tbody').text()
    expect(text).toContain(formatMonth('2026-03'))
  })

  it('shows billable/planned lessons, or "—" when lessonsPlanned is null', () => {
    const withLessons = mountTable([
      makeMonth({ lessonsBillable: 5, lessonsPlanned: 8 }),
    ]).get('tbody')
    expect(withLessons.text()).toContain('5 /')
    expect(withLessons.text()).toContain('8')

    const noLessons = mountTable([makeMonth({ lessonsPlanned: undefined })]).get('tbody')
    expect(noLessons.text()).toContain('—')
  })

  it('bolds and reddens the payable-now column when > 0', () => {
    const wrapper = mountTable([makeMonth({ payableNow: 50000 })])
    const cell = wrapper.get('tbody').find('.font-semibold.text-danger')
    expect(cell.exists()).toBe(true)
    expect(cell.text()).toBe(formatSom(50000))
  })

  it('does not bold the payable-now column when 0', () => {
    const wrapper = mountTable([makeMonth({ payableNow: 0 })])
    expect(wrapper.get('tbody').find('.font-semibold.text-danger').exists()).toBe(false)
  })

  it('shows the cash-debt hint only when pendingAmount > 0', () => {
    const withPending = mountTable([makeMonth({ pendingAmount: 1000, remaining: 20000 })]).get('tbody')
    expect(withPending.text()).toContain(
      t('students.view.table.cashDebtHint', { amount: formatSom(20000) }),
    )

    const noPending = mountTable([makeMonth({ pendingAmount: 0, remaining: 20000 })]).get('tbody')
    expect(noPending.text()).not.toContain(
      t('students.view.table.cashDebtHint', { amount: formatSom(20000) }),
    )
  })

  it('renders the status badge with the matching label key', () => {
    const text = mountTable([makeMonth({ status: PaymentStatus.PARTIAL })]).get('tbody').text()
    expect(text).toContain(t(PAYMENT_STATUS_LABEL_KEYS[PaymentStatus.PARTIAL]))
  })

  it('shows the empty text when there are no months', () => {
    expect(mountTable([]).text()).toContain(t('students.view.table.empty'))
  })
})
