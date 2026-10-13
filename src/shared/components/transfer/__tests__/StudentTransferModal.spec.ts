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

  it('past date: shows the backdate warning and the marks to delete', () => {
    mountModal({ impact: { past: true, attendanceToDelete: 4 }, totalDebt: 50000 })
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('students.transfer.backdateWarning'))
    expect(text).toContain(t('students.transfer.attendanceDeleted', { count: 4 }))
    // The debt warning still shows next to it — they are independent.
    expect(text).toContain(t('students.transfer.debtWarning', { amount: formatSom(50000) }))
  })

  it('today with marks: only the deletion line, no backdate text', () => {
    mountModal({ impact: { past: false, attendanceToDelete: 1 } })
    const text = document.body.textContent ?? ''
    expect(text).not.toContain(t('students.transfer.backdateWarning'))
    expect(text).toContain(t('students.transfer.attendanceDeleted', { count: 1 }))
  })

  it('past date without marks: no deletion line', () => {
    mountModal({ impact: { past: true, attendanceToDelete: 0 } })
    const text = document.body.textContent ?? ''
    expect(text).toContain(t('students.transfer.backdateWarning'))
    expect(text).not.toContain(t('students.transfer.attendanceDeleted', { count: 0 }))
  })

  it('shows nothing without an impact', () => {
    mountModal({ impact: null })
    expect(document.body.textContent).not.toContain(t('students.transfer.backdateWarning'))
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
