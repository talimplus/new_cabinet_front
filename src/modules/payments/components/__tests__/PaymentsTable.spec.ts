import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentsTable from '../PaymentsTable.vue'
import { PAYMENT_COLUMNS } from '../../config/payment-columns'
import { PaymentStatus, PAYMENT_STATUS_LABEL_KEYS } from '../../enums/payment-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    student: { firstName: 'Ali', lastName: 'Valiyev' },
    group: { name: 'A1' },
    amountDue: 600000,
    amountPaid: 0,
    remainingAmount: 600000,
    status: PaymentStatus.UNPAID,
    forMonth: '2026-09',
    dueDate: '2026-09-10',
    hardDueDate: '2026-09-20',
    isOverdue: false,
    lessonsPlanned: 12,
    lessonsBillable: 12,
    createdAt: '2026-09-01',
    ...overrides,
  }
}

function mountTable(rows: Payment[], canPay = true) {
  return mount(PaymentsTable, { props: { columns: PAYMENT_COLUMNS, rows, canPay } })
}

const historyLabel = t('payments.history.title')

// UiTable renders each row twice (desktop table + mobile card), so element
// counts are scoped to `tbody` — the desktop rendering.
describe('PaymentsTable', () => {
  it('renders the student name, group and the status badge label', () => {
    const wrapper = mountTable([makePayment()])
    expect(wrapper.text()).toContain('Ali Valiyev')
    expect(wrapper.text()).toContain('A1')
    expect(wrapper.text()).toContain(t(PAYMENT_STATUS_LABEL_KEYS[PaymentStatus.UNPAID]))
  })

  it('shows the overdue chip only when isOverdue', () => {
    expect(mountTable([makePayment({ isOverdue: false })]).text()).not.toContain(t('payments.chips.overdue'))
    expect(mountTable([makePayment({ isOverdue: true })]).text()).toContain(t('payments.chips.overdue'))
  })

  it('marks a positive remaining amount with the danger token class', () => {
    const withRemaining = mountTable([makePayment({ remainingAmount: 500000 })])
    expect(withRemaining.html()).toContain('text-danger')

    const settled = mountTable([makePayment({ remainingAmount: 0, status: PaymentStatus.PAID })])
    // The remaining cell should not carry the danger class when fully settled.
    expect(settled.find('.text-danger').exists()).toBe(false)
  })

  it('hides pay actions and shows the paid label when status is PAID', () => {
    const paid = mountTable([makePayment({ status: PaymentStatus.PAID, remainingAmount: 0 })])
    expect(paid.text()).toContain(t('payments.status.paid'))
    expect(paid.findAll('tbody button')).toHaveLength(0)
  })

  it('emits mark-as-paid and partial from the action buttons', async () => {
    const payment = makePayment()
    const wrapper = mountTable([payment])
    const buttons = wrapper.findAll('tbody button')
    expect(buttons).toHaveLength(2)

    await buttons[0]!.trigger('click')
    await buttons[1]!.trigger('click')

    expect(wrapper.emitted('mark-as-paid')?.[0]).toEqual([payment])
    expect(wrapper.emitted('partial')?.[0]).toEqual([payment])
  })

  describe('remaining column — payableNow, not remainingAmount', () => {
    it('renders payableNow when the backend supplies it, not remainingAmount', () => {
      const wrapper = mountTable([
        makePayment({ remainingAmount: 600000, pendingAmount: 200000, payableNow: 400000 }),
      ])
      const cell = wrapper.find('tbody tr').findAll('td')[4]!
      expect(cell.text()).toContain(formatSom(400000))
      expect(cell.text()).not.toContain(formatSom(600000))
    })

    it('falls back to remainingAmount − pendingAmount when payableNow is absent', () => {
      const wrapper = mountTable([
        makePayment({ remainingAmount: 600000, pendingAmount: 200000, payableNow: undefined }),
      ])
      const cell = wrapper.find('tbody tr').findAll('td')[4]!
      expect(cell.text()).toContain(formatSom(400000))
    })
  })

  describe('pending column', () => {
    it('shows the request count and pending amount when hasPendingReceipt', () => {
      const wrapper = mountTable([
        makePayment({ hasPendingReceipt: true, pendingReceiptsCount: 3, pendingAmount: 150000 }),
      ])
      const cell = wrapper.find('tbody tr').findAll('td')[6]!
      expect(cell.text()).toContain(t('payments.table.requests', { count: 3 }))
      expect(cell.text()).toContain(formatSom(150000))
    })

    it('shows a dash when there is no pending receipt', () => {
      const wrapper = mountTable([makePayment()])
      const cell = wrapper.find('tbody tr').findAll('td')[6]!
      expect(cell.text()).toBe('—')
    })
  })

  it('renders hardDueDate', () => {
    const wrapper = mountTable([makePayment({ hardDueDate: '2026-09-20' })])
    expect(wrapper.find('tbody').text()).toContain(formatDate('2026-09-20'))
  })

  it('formats amountDue when it arrives as a decimal string', () => {
    const wrapper = mountTable([makePayment({ amountDue: '138461.54' })])
    expect(wrapper.find('tbody').text()).toContain(formatSom(138461.54))
  })

  it('shows a refunded sub-line only when refundedAmount is positive', () => {
    const withRefund = mountTable([makePayment({ refundedAmount: 50000 })])
    expect(withRefund.text()).toContain(t('payments.table.refunded', { amount: formatSom(50000) }))

    const without = mountTable([makePayment({ refundedAmount: 0 })])
    expect(without.text()).not.toContain(t('payments.table.refunded', { amount: formatSom(50000) }))
  })

  it('shows an excluded sub-line with its reason only when manualExcludedAmount is positive', () => {
    const withExclusion = mountTable([
      makePayment({ manualExcludedAmount: 30000, manualExcludedReason: 'kasal bo‘lgan' }),
    ])
    expect(withExclusion.text()).toContain(t('payments.table.excluded', { amount: formatSom(30000) }))
    expect(withExclusion.text()).toContain('kasal bo‘lgan')

    const without = mountTable([makePayment({ manualExcludedAmount: 0, manualExcludedReason: null })])
    expect(without.text()).not.toContain('kasal bo‘lgan')
  })

  describe('overdue row tint', () => {
    it('tints both the desktop row and the mobile card when isOverdue', () => {
      const wrapper = mountTable([makePayment({ isOverdue: true })])
      expect(wrapper.find('tbody tr').classes().join(' ')).toContain('bg-danger-soft')
      expect(wrapper.find('article').classes().join(' ')).toContain('bg-danger-soft')
    })

    it('does not tint a row that is not overdue', () => {
      const wrapper = mountTable([makePayment({ isOverdue: false })])
      expect(wrapper.find('tbody tr').classes().join(' ')).not.toContain('bg-danger-soft')
      expect(wrapper.find('article').classes().join(' ')).not.toContain('bg-danger-soft')
    })
  })

  describe('row actions', () => {
    it('hides pay buttons when canPay is false, even with a positive payable amount', () => {
      const wrapper = mountTable([makePayment({ payableNow: 400000 })], false)
      expect(wrapper.findAll('tbody button')).toHaveLength(0)
    })

    it('hides pay buttons once payableNow is 0', () => {
      const wrapper = mountTable([makePayment({ payableNow: 0 })])
      expect(wrapper.findAll('tbody button')).toHaveLength(0)
    })

    it('shows the paid marker instead of pay buttons once fully paid', () => {
      const wrapper = mountTable([makePayment({ status: PaymentStatus.PAID, payableNow: 0 })])
      expect(wrapper.text()).toContain(t('payments.status.paid'))
      expect(wrapper.findAll('tbody button')).toHaveLength(0)
    })

    it('shows the history icon button only once money has actually been received', () => {
      const none = mountTable([makePayment({ amountPaid: 0, hasPendingReceipt: false })])
      expect(none.find('tbody').find(`button[aria-label="${historyLabel}"]`).exists()).toBe(false)

      const paidSome = mountTable([makePayment({ amountPaid: 100000 })])
      expect(paidSome.find('tbody').find(`button[aria-label="${historyLabel}"]`).exists()).toBe(true)

      const pending = mountTable([makePayment({ hasPendingReceipt: true })])
      expect(pending.find('tbody').find(`button[aria-label="${historyLabel}"]`).exists()).toBe(true)
    })

    it('emits history with the row when the history button is clicked', async () => {
      const payment = makePayment({ amountPaid: 100000 })
      const wrapper = mountTable([payment])
      await wrapper.find('tbody').find(`button[aria-label="${historyLabel}"]`).trigger('click')
      expect(wrapper.emitted('history')?.[0]).toEqual([payment])
    })
  })
})
