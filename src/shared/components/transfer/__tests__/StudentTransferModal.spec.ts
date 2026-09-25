import { describe, it, expect, afterEach } from 'vitest'
import { reactive } from 'vue'
import { mount } from '@vue/test-utils'
import StudentTransferModal from '../StudentTransferModal.vue'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function makeState(overrides: Record<string, unknown> = {}) {
  return reactive({
    open: true,
    fromGroupId: 1,
    fromGroupName: 'Group A',
    toGroupId: null,
    date: null,
    reason: '',
    closeSourceGroup: false,
    loading: false,
    previewing: false,
    ...overrides,
  })
}

const groupOptions: SelectOption[] = [{ label: 'Group B', value: 2 }]

function mountModal(props: Record<string, unknown> = {}) {
  return mount(StudentTransferModal, {
    attachTo: document.body,
    props: {
      state: makeState(),
      groupOptions,
      totalDebt: 0,
      totalOverpaid: 0,
      ...props,
    },
  })
}

describe('StudentTransferModal', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the debt warning only when totalDebt > 0', () => {
    mountModal({ totalDebt: 50000 })
    expect(document.body.textContent).toContain(
      t('students.transfer.debtWarning', { amount: formatSom(50000) }),
    )

    document.body.innerHTML = ''
    mountModal({ totalDebt: 0 })
    expect(document.body.textContent).not.toContain(
      t('students.transfer.debtWarning', { amount: formatSom(0) }),
    )
  })

  it('shows the overpaid notice only when totalOverpaid > 0', () => {
    mountModal({ totalOverpaid: 30000 })
    expect(document.body.textContent).toContain(
      t('students.transfer.overpaidNotice', { amount: formatSom(30000) }),
    )

    document.body.innerHTML = ''
    mountModal({ totalOverpaid: 0 })
    expect(document.body.textContent).not.toContain(
      t('students.transfer.overpaidNotice', { amount: formatSom(0) }),
    )
  })

  it('hides both the debt warning and overpaid notice while previewing', () => {
    mountModal({
      totalDebt: 50000,
      totalOverpaid: 30000,
      state: makeState({ previewing: true }),
    })
    expect(document.body.textContent).not.toContain(
      t('students.transfer.debtWarning', { amount: formatSom(50000) }),
    )
    expect(document.body.textContent).not.toContain(
      t('students.transfer.overpaidNotice', { amount: formatSom(30000) }),
    )
    expect(document.body.textContent).toContain(t('payments.exclusion.calculating'))
  })

  it('disables the submit button unless valid, and emits confirm', async () => {
    mountModal({ valid: false })
    expect(findButton(t('students.transfer.submit')).disabled).toBe(true)

    document.body.innerHTML = ''
    const wrapper = mountModal({ valid: true })
    const button = findButton(t('students.transfer.submit'))
    expect(button.disabled).toBe(false)
    button.click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)
  })

  it('emits close on cancel', async () => {
    const wrapper = mountModal()
    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
