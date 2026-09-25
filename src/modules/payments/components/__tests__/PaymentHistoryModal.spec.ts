import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PaymentHistoryModal from '../PaymentHistoryModal.vue'
import { PaymentStatus } from '../../enums/payment-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { Payment } from '../../interfaces/payment.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'
import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'

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

function makeCheck(overrides: Partial<PaymentCheck> = {}): PaymentCheck {
  return {
    receiptId: 1,
    checkNo: '1',
    status: ReceiptStatus.CONFIRMED,
    student: { fullName: 'Ali Valiyev' },
    group: { name: 'A1' },
    teacher: null,
    forMonth: '2026-09',
    amount: 200000,
    paymentMethod: PaymentMethod.CASH,
    receivedAt: '2026-09-05T10:00:00Z',
    createdAt: '2026-09-05T10:00:00Z',
    receivedBy: { fullName: 'Admin Adminov' },
    ...overrides,
  }
}

// UiModal teleports its content to <body>, so `wrapper.text()`/`wrapper.find`
// don't see it. Following UiModal.spec.ts's pattern: mount attached to the
// document and query `document.body` directly.
function mountModal(props: Partial<InstanceType<typeof PaymentHistoryModal>['$props']> = {}) {
  return mount(PaymentHistoryModal, {
    attachTo: document.body,
    props: {
      open: true,
      payment: makePayment(),
      receipts: [],
      ...props,
    },
  })
}

const lastEmitted = (events: unknown[][] | undefined) => (events ? events[events.length - 1] : undefined)

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

describe('PaymentHistoryModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('joins student · group · month in the subtitle', () => {
    mountModal({ payment: makePayment({ forMonth: '2026-09' }) })
    expect(document.body.textContent).toContain('Ali Valiyev · A1 · 09.2026')
  })

  it('excludes rejected receipts from the total', () => {
    const receipts = [
      makeCheck({ receiptId: 1, amount: 200000, status: ReceiptStatus.CONFIRMED }),
      makeCheck({ receiptId: 2, amount: 100000, status: ReceiptStatus.REJECTED }),
      makeCheck({ receiptId: 3, amount: 50000, status: ReceiptStatus.PENDING }),
    ]
    mountModal({ receipts })
    // 200000 + 50000, NOT the rejected 100000
    expect(document.body.textContent).toContain(formatSom(250000))
  })

  it('emits print with every receipt from "print all", and with a single receipt from a row button', async () => {
    const receipts = [
      makeCheck({ receiptId: 1, amount: 200000 }),
      makeCheck({ receiptId: 2, amount: 100000 }),
    ]
    const wrapper = mountModal({ receipts })

    findButton(t('payments.history.printAll')).click()
    await wrapper.vm.$nextTick()
    expect(lastEmitted(wrapper.emitted('print'))).toEqual([receipts])

    const rowButton = document.body.querySelector(
      `button[aria-label="${t('payments.history.printOne')}"]`,
    ) as HTMLButtonElement
    rowButton.click()
    await wrapper.vm.$nextTick()
    expect(lastEmitted(wrapper.emitted('print'))).toEqual([[receipts[0]]])
  })

  it('shows a retry button in the failed state that emits retry', async () => {
    const wrapper = mountModal({ failed: true, receipts: [] })
    expect(document.body.textContent).toContain(t('payments.history.loadError'))

    findButton(t('payments.history.retry')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('retry')).toHaveLength(1)
  })
})
