import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PendingReceiptsTable from '../PendingReceiptsTable.vue'
import { UiCheckbox } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatDateTime } from '@/shared/utils/format-date'
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

function mountTable(
  rows: PendingReceipt[],
  props: Record<string, unknown> = {},
  isSelected: (id: number) => boolean = () => false,
) {
  return mount(PendingReceiptsTable, { props: { rows, isSelected, ...props } })
}

// UiTable renders each row twice (desktop table + mobile card), so element
// counts/interactions are scoped to `tbody` — the desktop rendering.
describe('PendingReceiptsTable', () => {
  it('renders the student name, group and amount via parseFloat', () => {
    const wrapper = mountTable([makeReceipt()], { canConfirm: true, canReject: true })
    const text = wrapper.text()

    expect(text).toContain('Ali Valiyev')
    expect(text).toContain('Ingliz A1')
    expect(text).toContain('09.2025')
    expect(text).toContain(formatSom(250000))
  })

  it('shows the empty text when there are no rows', () => {
    const wrapper = mountTable([])
    expect(wrapper.text()).toContain(t('pendingReceipts.empty'))
  })

  it('shows the filtered empty text when hasFilters is true', () => {
    const wrapper = mountTable([], { hasFilters: true })
    expect(wrapper.text()).toContain(t('pendingReceipts.emptyFiltered'))
    expect(wrapper.text()).not.toContain(t('pendingReceipts.empty'))
  })

  it('falls back to createdAt when receivedAt is null', () => {
    // The interface types `receivedAt` as `string`, but the component's own
    // `?? createdAt` fallback implies it can be null at runtime — see the
    // report for this gap. Cast to exercise the real (nullable) behaviour.
    const wrapper = mountTable([
      makeReceipt({
        receivedAt: null,
        createdAt: '2025-09-02T08:30:00Z',
      }),
    ])
    expect(wrapper.get('tbody').text()).toContain(formatDateTime('2025-09-02T08:30:00Z'))
  })

  it('renders a checkbox with the student name as its label when canConfirm', () => {
    const wrapper = mountTable([makeReceipt()], { canConfirm: true })
    const checkbox = wrapper.get('tbody').findComponent(UiCheckbox)
    expect(checkbox.exists()).toBe(true)
    expect(checkbox.props('label')).toBe('Ali Valiyev')
  })

  it('renders a plain name (no checkbox) when canConfirm is false', () => {
    const wrapper = mountTable([makeReceipt()], { canConfirm: false })
    expect(wrapper.get('tbody').findComponent(UiCheckbox).exists()).toBe(false)
    expect(wrapper.get('tbody').text()).toContain('Ali Valiyev')
  })

  it('emits toggle with the row when the checkbox is ticked', async () => {
    const receipt = makeReceipt({ id: 7 })
    const wrapper = mountTable([receipt], { canConfirm: true })

    await wrapper.get('tbody').get('input[type="checkbox"]').setValue(true)

    expect(last(wrapper.emitted('toggle') ?? [])).toEqual([receipt])
  })

  it('tints a selected row with bg-primary-soft on both the tr and the article', () => {
    const receipt = makeReceipt({ id: 9 })
    const wrapper = mountTable([receipt], { canConfirm: true }, (id) => id === 9)

    expect(wrapper.get('tbody tr').classes().join(' ')).toContain('bg-primary-soft')
    expect(wrapper.get('article').classes().join(' ')).toContain('bg-primary-soft')
  })

  it('does not tint an unselected row', () => {
    const wrapper = mountTable([makeReceipt({ id: 9 })], { canConfirm: true }, () => false)

    expect(wrapper.get('tbody tr').classes().join(' ')).not.toContain('bg-primary-soft')
    expect(wrapper.get('article').classes().join(' ')).not.toContain('bg-primary-soft')
  })

  it('shows the confirm and reject text buttons gated by canConfirm/canReject', () => {
    const both = mountTable([makeReceipt()], { canConfirm: true, canReject: true })
    expect(both.get('tbody').text()).toContain(t('pendingReceipts.approve'))
    expect(both.get('tbody').text()).toContain(t('pendingReceipts.reject'))

    const neither = mountTable([makeReceipt()], { canConfirm: false, canReject: false })
    expect(neither.get('tbody').text()).not.toContain(t('pendingReceipts.approve'))
    expect(neither.get('tbody').text()).not.toContain(t('pendingReceipts.reject'))
  })

  it('disables the action buttons while processing', () => {
    const wrapper = mountTable([makeReceipt()], {
      canConfirm: true,
      canReject: true,
      processing: true,
    })
    const buttons = wrapper.get('tbody').findAll('button')
    for (const button of buttons) {
      expect(button.attributes('disabled')).toBeDefined()
    }
  })

  it('emits confirm and reject with the row when the action buttons are clicked', async () => {
    const receipt = makeReceipt({ id: 42 })
    const wrapper = mountTable([receipt], { canConfirm: true, canReject: true })
    const buttons = wrapper.get('tbody').findAll('button')
    const confirmButton = buttons.find((b) => b.text() === t('pendingReceipts.approve'))
    const rejectButton = buttons.find((b) => b.text() === t('pendingReceipts.reject'))

    await confirmButton!.trigger('click')
    await rejectButton!.trigger('click')

    expect(wrapper.emitted('confirm')?.[0]).toEqual([receipt])
    expect(wrapper.emitted('reject')?.[0]).toEqual([receipt])
  })
})
