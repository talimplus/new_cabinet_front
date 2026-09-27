import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentAmountCell from '../PaymentAmountCell.vue'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { Payment } from '../../interfaces/payment.interface'

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    student: { firstName: 'Ali', lastName: 'Valiyev' },
    group: { name: 'A1' },
    amountDue: '540000.00',
    amountPaid: 0,
    remainingAmount: 540000,
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

function mountCell(overrides: Partial<Payment> = {}) {
  return mount(PaymentAmountCell, { props: { payment: makePayment(overrides) } })
}

describe('PaymentAmountCell', () => {
  it('renders the amount due (string DECIMAL) formatted', () => {
    expect(mountCell().text()).toContain(formatSom(540000))
  })

  it('shows the discount percent', () => {
    expect(mountCell({ discountPercentApplied: 10 }).text()).toContain(
      t('payments.table.discount', { value: '10%' }),
    )
  })

  it('shows the fixed discount amount', () => {
    expect(mountCell({ discountAmountApplied: 50000 }).text()).toContain(
      t('payments.table.discount', { value: formatSom(50000) }),
    )
  })

  it('joins percent and amount when both apply', () => {
    expect(mountCell({ discountPercentApplied: 10, discountAmountApplied: 50000 }).text()).toContain(
      t('payments.table.discount', { value: `10% · ${formatSom(50000)}` }),
    )
  })

  it('hides the discount line when both are 0 or undefined', () => {
    const empty = t('payments.table.discount', { value: '' }).trim()
    expect(mountCell().find('.text-info').exists()).toBe(false)
    expect(mountCell({ discountPercentApplied: 0, discountAmountApplied: 0 }).find('.text-info').exists()).toBe(false)
    expect(mountCell().text()).not.toContain(empty)
  })

  it('shows refunded and excluded lines only when positive', () => {
    const wrapper = mountCell({ refundedAmount: 20000, manualExcludedAmount: '15000.00', manualExcludedReason: 'Kasal' })
    expect(wrapper.text()).toContain(t('payments.table.refunded', { amount: formatSom(20000) }))
    expect(wrapper.text()).toContain(t('payments.table.excluded', { amount: formatSom(15000) }))
    expect(wrapper.text()).toContain('(Kasal)')

    const plain = mountCell()
    expect(plain.find('.text-success').exists()).toBe(false)
    expect(plain.find('.text-warning').exists()).toBe(false)
  })
})
