import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentStatusCell from '../PaymentStatusCell.vue'
import { PaymentStatus } from '../../enums/payment-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import { t } from '@/locales'

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1, student: { firstName: 'Ali', lastName: 'V' }, group: { name: 'A1' },
    amountDue: '400000', amountPaid: '0', remainingAmount: 400000, status: PaymentStatus.UNPAID,
    forMonth: '2026-10-01', dueDate: '2026-10-10', hardDueDate: '2026-10-15', isOverdue: false,
    lessonsPlanned: 13, lessonsBillable: 13, createdAt: '2026-10-01',
    ...overrides,
  }
}

describe('PaymentStatusCell', () => {
  it('shows the row status when nothing is pending', () => {
    const w = mount(PaymentStatusCell, { props: { payment: makePayment() } })
    expect(w.text()).toContain(t('payments.status.unpaid'))
  })

  it('the whole month handed to reception → "awaiting confirmation", not "unpaid"', () => {
    const w = mount(PaymentStatusCell, {
      props: { payment: makePayment({ hasPendingReceipt: true, pendingAmount: 400000, payableNow: 0 }) },
    })
    expect(w.text()).toContain(t('payments.chips.handedOver'))
    expect(w.text()).not.toContain(t('payments.status.unpaid'))
    expect(w.text()).not.toContain(t('payments.chips.pendingAdmin'))
  })

  it('a part handed over keeps the status plus the pending chip', () => {
    const w = mount(PaymentStatusCell, {
      props: { payment: makePayment({ hasPendingReceipt: true, pendingAmount: 100000, payableNow: 300000 }) },
    })
    expect(w.text()).toContain(t('payments.status.unpaid'))
    expect(w.text()).toContain(t('payments.chips.pendingAdmin'))
  })
})
