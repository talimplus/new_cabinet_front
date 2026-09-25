import { describe, it, expect, afterEach } from 'vitest'
import { mount, DOMWrapper } from '@vue/test-utils'
import ReceiptRejectDialog from '../ReceiptRejectDialog.vue'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import type { PendingReceipt } from '../../interfaces/pending-receipt.interface'
import { t } from '@/locales'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

function makeReceipt(overrides: Partial<PendingReceipt> = {}): PendingReceipt {
  return {
    id: 1,
    paymentId: 11,
    amount: '250000',
    receivedById: 2,
    receivedAt: '2025-09-01T10:00:00Z',
    confirmedById: null,
    confirmedAt: null,
    status: ReceiptStatus.PENDING,
    comment: null,
    createdAt: '2025-09-01T10:00:00Z',
    payment: {
      id: 11,
      studentId: 5,
      groupId: 3,
      forMonth: '2025-09',
      student: { firstName: 'Ali', lastName: 'Valiyev' },
      group: { name: 'Ingliz A1' },
    },
    ...overrides,
  }
}

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(ReceiptRejectDialog, {
    attachTo: document.body,
    props: {
      modelValue: true,
      receipt: makeReceipt(),
      reason: '',
      ...props,
    },
  })
}

describe('ReceiptRejectDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the student name, formatted amount and month', () => {
    mountDialog({ receipt: makeReceipt({ amount: '250000' }) })
    expect(document.body.textContent).toContain('Ali Valiyev')
    expect(document.body.textContent).toContain(formatSom(250000))
    expect(document.body.textContent).toContain(formatMonth('2025-09'))
  })

  it('two-way binds the reason through the textarea', async () => {
    const wrapper = mountDialog({ reason: '' })
    const textarea = document.body.querySelector('textarea') as HTMLTextAreaElement
    expect(textarea).not.toBeNull()
    await new DOMWrapper(textarea).setValue("Notog'ri chek")

    expect(last(wrapper.emitted('update:reason') ?? [])).toEqual(["Notog'ri chek"])
  })

  it('emits reject when the reject button is clicked', async () => {
    const wrapper = mountDialog()
    findButton(t('pendingReceipts.reject')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('reject')).toHaveLength(1)
  })

  it('emits update:modelValue(false) on cancel', async () => {
    const wrapper = mountDialog()
    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:modelValue') ?? [])).toEqual([false])
  })
})
