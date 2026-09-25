import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ReceiptToolbar from '../ReceiptToolbar.vue'
import { UiCheckbox, UiButton } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { t } from '@/locales'

const last = <T>(a: T[]): T | undefined => a[a.length - 1]

function baseProps(overrides: Record<string, unknown> = {}) {
  return {
    rowCount: 10,
    selectedCount: 0,
    selectedAmount: 0,
    allOnPage: false,
    someOnPage: false,
    pendingTotal: 0,
    pendingTotalAmount: 0,
    canConfirm: true,
    ...overrides,
  }
}

describe('ReceiptToolbar', () => {
  it('shows the page tick-box only with canConfirm', () => {
    const withConfirm = mount(ReceiptToolbar, { props: baseProps({ canConfirm: true }) })
    expect(withConfirm.findComponent(UiCheckbox).exists()).toBe(true)

    const without = mount(ReceiptToolbar, { props: baseProps({ canConfirm: false }) })
    expect(without.findComponent(UiCheckbox).exists()).toBe(false)
  })

  it('disables the page tick-box when rowCount is 0', () => {
    const empty = mount(ReceiptToolbar, { props: baseProps({ rowCount: 0 }) })
    expect(empty.findComponent(UiCheckbox).props('disabled')).toBe(true)

    const withRows = mount(ReceiptToolbar, { props: baseProps({ rowCount: 5 }) })
    expect(withRows.findComponent(UiCheckbox).props('disabled')).toBe(false)
  })

  it('reflects allOnPage/someOnPage on the tick-box', () => {
    const all = mount(ReceiptToolbar, {
      props: baseProps({ allOnPage: true, someOnPage: false }),
    })
    expect(all.findComponent(UiCheckbox).props('modelValue')).toBe(true)
    expect(all.findComponent(UiCheckbox).props('indeterminate')).toBe(false)

    const some = mount(ReceiptToolbar, {
      props: baseProps({ allOnPage: false, someOnPage: true }),
    })
    expect(some.findComponent(UiCheckbox).props('modelValue')).toBe(false)
    expect(some.findComponent(UiCheckbox).props('indeterminate')).toBe(true)
  })

  it('emits toggle-page with the boolean', async () => {
    const wrapper = mount(ReceiptToolbar, { props: baseProps() })
    await wrapper.findComponent(UiCheckbox).vm.$emit('update:modelValue', true)
    expect(last(wrapper.emitted('toggle-page') ?? [])).toEqual([true])
  })

  it('hides the selection summary and confirm-selected button when selectedCount is 0', () => {
    const wrapper = mount(ReceiptToolbar, { props: baseProps({ selectedCount: 0 }) })
    expect(wrapper.text()).not.toContain(t('pendingReceipts.bulk.confirmSelected'))
    expect(wrapper.classes().join(' ')).not.toContain('bg-primary-soft')
  })

  it('shows the selection summary, formatted amount and confirm-selected button when selectedCount > 0', () => {
    const wrapper = mount(
      ReceiptToolbar,
      { props: baseProps({ selectedCount: 3, selectedAmount: 300000 }) },
    )
    expect(wrapper.text()).toContain(t('pendingReceipts.bulk.selected', { count: 3 }))
    expect(wrapper.text()).toContain(formatSom(300000))
    expect(wrapper.text()).toContain(t('pendingReceipts.bulk.confirmSelected'))
    expect(wrapper.classes().join(' ')).toContain('bg-primary-soft')
  })

  it('shows "confirm all" only when canConfirm and pendingTotal > 0, with the count/amount in the label', () => {
    const wrapper = mount(
      ReceiptToolbar,
      { props: baseProps({ canConfirm: true, pendingTotal: 8, pendingTotalAmount: 800000 }) },
    )
    expect(wrapper.text()).toContain(
      t('pendingReceipts.bulk.confirmAllCount', { count: 8, amount: formatSom(800000) }),
    )

    const noPending = mount(ReceiptToolbar, { props: baseProps({ pendingTotal: 0 }) })
    expect(noPending.text()).not.toContain(t('pendingReceipts.bulk.confirmAllCount', { count: 0, amount: formatSom(0) }))

    const noPermission = mount(
      ReceiptToolbar,
      { props: baseProps({ canConfirm: false, pendingTotal: 8, pendingTotalAmount: 800000 }) },
    )
    expect(noPermission.findAllComponents(UiButton).length).toBe(0)
  })

  it('emits clear, confirm-selected and confirm-all', async () => {
    const wrapper = mount(
      ReceiptToolbar,
      {
        props: baseProps({
          selectedCount: 2,
          selectedAmount: 200000,
          pendingTotal: 4,
          pendingTotalAmount: 400000,
        }),
      },
    )
    const buttons = wrapper.findAllComponents(UiButton)
    const clearButton = buttons.find((b) => b.text() === t('pendingReceipts.bulk.clearSelection'))
    const confirmSelectedButton = buttons.find(
      (b) => b.text().includes(t('pendingReceipts.bulk.confirmSelected')),
    )
    const confirmAllButton = buttons.find((b) =>
      b.text().includes(
        t('pendingReceipts.bulk.confirmAllCount', { count: 4, amount: formatSom(400000) }),
      ),
    )

    await clearButton!.trigger('click')
    await confirmSelectedButton!.trigger('click')
    await confirmAllButton!.trigger('click')

    expect(wrapper.emitted('clear')).toHaveLength(1)
    expect(wrapper.emitted('confirm-selected')).toHaveLength(1)
    expect(wrapper.emitted('confirm-all')).toHaveLength(1)
  })
})
