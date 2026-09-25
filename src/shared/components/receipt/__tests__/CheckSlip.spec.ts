import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import CheckSlip from '../CheckSlip.vue'
import { PaymentMethod, PAYMENT_METHOD_LABEL_KEYS } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

function makeCheck(overrides: Partial<PaymentCheck> = {}): PaymentCheck {
  return {
    checkNo: '1-A',
    status: ReceiptStatus.CONFIRMED,
    student: { fullName: 'Ali Valiyev', phone: '+998901234567' },
    group: { name: 'A1' },
    teacher: { fullName: "Bekzod O'qituvchi" },
    forMonth: '2026-09',
    amount: 400000,
    balanceBefore: 600000,
    balanceAfter: 200000,
    paymentMethod: PaymentMethod.CASH,
    receivedAt: '2026-09-05T10:00:00Z',
    createdAt: '2026-09-05T10:00:00Z',
    receivedBy: { fullName: 'Admin Adminov' },
    ...overrides,
  }
}

describe('CheckSlip', () => {
  it('renders the check number, student/group/teacher names, method, both balances and the amount', () => {
    const wrapper = mount(CheckSlip, { props: { check: makeCheck() } })
    const text = wrapper.text()

    expect(text).toContain('1-A')
    expect(text).toContain('Ali Valiyev')
    expect(text).toContain('A1')
    expect(text).toContain("Bekzod O'qituvchi")
    expect(text).toContain(t(PAYMENT_METHOD_LABEL_KEYS[PaymentMethod.CASH]))
    expect(text).toContain(formatSom(600000))
    expect(text).toContain(formatSom(200000))
    expect(text).toContain(formatSom(400000))
  })

  it('renders a dash for null student/group/teacher/receivedBy', () => {
    const wrapper = mount(CheckSlip, {
      props: {
        check: makeCheck({ student: null, group: null, teacher: null, receivedBy: null }),
      },
    })
    // one dash per null relation (fullName, phone, group, teacher, receivedBy)
    expect(wrapper.findAll('.v').filter((cell) => cell.text() === '—').length).toBeGreaterThanOrEqual(5)
  })

  it('shows the pending banner only for ReceiptStatus.PENDING', () => {
    const pending = mount(CheckSlip, { props: { check: makeCheck({ status: ReceiptStatus.PENDING } ) } })
    expect(pending.text()).toContain(t('payments.check.pending'))

    const confirmed = mount(CheckSlip, { props: { check: makeCheck({ status: ReceiptStatus.CONFIRMED }) } })
    expect(confirmed.text()).not.toContain(t('payments.check.pending'))
  })

  it('shows the transaction row only when transactionNo is set', () => {
    const withTxn = mount(CheckSlip, { props: { check: makeCheck({ transactionNo: 'TXN-123' } ) } })
    expect(withTxn.text()).toContain(t('payments.check.transactionNo'))
    expect(withTxn.text()).toContain('TXN-123')

    const without = mount(CheckSlip, { props: { check: makeCheck({ transactionNo: undefined }) } })
    expect(without.text()).not.toContain(t('payments.check.transactionNo'))
  })

  it('carries the check-* class hooks the printer relies on', () => {
    const wrapper = mount(CheckSlip, { props: { check: makeCheck() } })
    expect(wrapper.find('.check').exists()).toBe(true)
    expect(wrapper.find('.check-header').exists()).toBe(true)
    expect(wrapper.find('.check-no').exists()).toBe(true)
    expect(wrapper.find('.check-table').exists()).toBe(true)
    expect(wrapper.find('.check-total').exists()).toBe(true)
  })
})
