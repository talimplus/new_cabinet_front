import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PayDebtModal from '../PayDebtModal.vue'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { DebtAllocation } from '../../../interfaces/pay-debt.interface'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

const allocation: DebtAllocation[] = [{ forMonth: '2026-09', groupName: 'Group A', allocated: 100000 }]

function mountModal(props: Record<string, unknown> = {}) {
  return mount(PayDebtModal, {
    attachTo: document.body,
    props: {
      open: true,
      amount: null,
      payableNow: 200000,
      allocation,
      method: PaymentMethod.CASH,
      paidAt: null,
      comment: '',
      ...props,
    },
  })
}

describe('PayDebtModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders the amount field with the payable-now hint', () => {
    mountModal()
    expect(document.body.textContent).toContain(
      `${t('students.view.stats.payableNow')}: ${formatSom(200000)}`,
    )
  })

  it('renders the passed error instead of the hint', () => {
    mountModal({ error: 'Summani kiriting' })
    expect(document.body.textContent).toContain('Summani kiriting')
  })

  it('emits update:amount as a number, or null when cleared', async () => {
    const wrapper = mountModal()
    const input = document.body.querySelector('input[type="number"]') as HTMLInputElement
    input.value = '42'
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:amount') ?? [])).toEqual([42])

    input.value = ''
    input.dispatchEvent(new Event('input'))
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:amount') ?? [])).toEqual([null])
  })

  it('disables the confirm button unless valid', () => {
    mountModal({ valid: false })
    expect(findButton(t('students.view.modal.pay')).disabled).toBe(true)

    document.body.innerHTML = ''
    mountModal({ valid: true })
    expect(findButton(t('students.view.modal.pay')).disabled).toBe(false)
  })

  it('emits confirm and close on the footer buttons', async () => {
    const wrapper = mountModal({ valid: true })

    findButton(t('students.view.modal.pay')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)

    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('renders the reception fields and the debt preview', () => {
    mountModal()
    expect(document.body.textContent).toContain(t('payments.reception.paymentMethod'))
    expect(document.body.textContent).toContain(t('students.view.modal.previewTitle'))
    expect(document.body.textContent).toContain('Group A')
  })
})
