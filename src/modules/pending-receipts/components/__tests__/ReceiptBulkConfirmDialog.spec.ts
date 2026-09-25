import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ReceiptBulkConfirmDialog from '../ReceiptBulkConfirmDialog.vue'
import { BulkConfirmMode } from '../../enums/bulk-confirm-mode.enum'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

function findButton(text: string): HTMLButtonElement {
  const buttons = Array.from(document.body.querySelectorAll('button'))
  const match = buttons.find((b) => b.textContent?.includes(text))
  if (!match) throw new Error(`No button found with text "${text}"`)
  return match
}

function mountDialog(props: Record<string, unknown> = {}) {
  return mount(ReceiptBulkConfirmDialog, {
    attachTo: document.body,
    props: {
      modelValue: true,
      mode: BulkConfirmMode.ALL,
      selectedCount: 0,
      selectedAmount: 0,
      pendingTotal: 0,
      pendingTotalAmount: 0,
      ...props,
    },
  })
}

describe('ReceiptBulkConfirmDialog', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('shows the all-mode title and question', () => {
    mountDialog({ mode: BulkConfirmMode.ALL, pendingTotal: 6, pendingTotalAmount: 600000 })
    expect(document.body.textContent).toContain(t('pendingReceipts.bulk.allTitle'))
    expect(document.body.textContent).toContain(
      t('pendingReceipts.bulk.allQuestion', { count: 6, amount: formatSom(600000) }),
    )
  })

  it('shows the selected-mode title and question', () => {
    mountDialog({
      mode: BulkConfirmMode.SELECTED,
      selectedCount: 3,
      selectedAmount: 300000,
    })
    expect(document.body.textContent).toContain(t('pendingReceipts.bulk.selectedTitle'))
    expect(document.body.textContent).toContain(
      t('pendingReceipts.bulk.selectedQuestion', { count: 3, amount: formatSom(300000) }),
    )
  })

  it('shows the no-filter warning only in ALL mode without filters', () => {
    mountDialog({ mode: BulkConfirmMode.ALL, hasFilters: false })
    expect(document.body.textContent).toContain(t('pendingReceipts.bulk.allNoFilterWarning'))
  })

  it('hides the no-filter warning in ALL mode with filters applied', () => {
    mountDialog({ mode: BulkConfirmMode.ALL, hasFilters: true })
    expect(document.body.textContent).not.toContain(t('pendingReceipts.bulk.allNoFilterWarning'))
  })

  it('hides the no-filter warning in SELECTED mode', () => {
    mountDialog({ mode: BulkConfirmMode.SELECTED, hasFilters: false })
    expect(document.body.textContent).not.toContain(t('pendingReceipts.bulk.allNoFilterWarning'))
  })

  it('emits confirm and update:modelValue(false) on the footer buttons', async () => {
    const wrapper = mountDialog()

    findButton(t('pendingReceipts.approve')).click()
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('confirm')).toHaveLength(1)

    findButton(t('common.cancel')).click()
    await wrapper.vm.$nextTick()
    expect(last(wrapper.emitted('update:modelValue') ?? [])).toEqual([false])
  })
})
