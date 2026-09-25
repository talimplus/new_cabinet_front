import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import StaffReceiptsTable from '../StaffReceiptsTable.vue'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import { PaymentMethod } from '@/shared/enums/payment-method.enum'
import { t } from '@/locales'
import type { UnsettledReceipt } from '../../interfaces/staff-overview.interface'

function makeReceipt(overrides: Partial<UnsettledReceipt> = {}): UnsettledReceipt {
  return {
    id: 1,
    amount: 200_000,
    status: ReceiptStatus.PENDING,
    paymentMethod: PaymentMethod.CASH,
    checkNo: '123',
    transactionNo: null,
    receivedAt: '2026-09-10T10:00:00Z',
    comment: null,
    student: { id: 5, firstName: 'Ali', lastName: 'Valiyev' },
    group: { id: 3, name: 'Matematika-1' },
    forMonth: '2026-09',
    ...overrides,
  }
}

function mountTable(rows: UnsettledReceipt[]) {
  return mount(StaffReceiptsTable, { props: { rows } })
}

describe('StaffReceiptsTable', () => {
  it('always renders the hint paragraph', () => {
    expect(mountTable([]).text()).toContain(t('staff.receipts.hint'))
    expect(mountTable([makeReceipt()]).text()).toContain(t('staff.receipts.hint'))
  })

  it('shows the student name and group sub-line', () => {
    const wrapper = mountTable([makeReceipt({ student: { id: 5, firstName: 'Ali', lastName: 'Valiyev' }, group: { id: 3, name: 'Matematika-1' } })])
    const cell = wrapper.get('tbody tr').findAll('td')[0]!
    expect(cell.text()).toContain('Ali Valiyev')
    expect(cell.text()).toContain('Matematika-1')
  })

  it('renders — for a null student', () => {
    const wrapper = mountTable([makeReceipt({ student: null })])
    const cell = wrapper.get('tbody tr').findAll('td')[0]!
    expect(cell.text()).toContain('—')
  })

  it('badges the status using RECEIPT_STATUS_VARIANTS and the receiptStatus i18n keys', () => {
    const pending = mountTable([makeReceipt({ status: ReceiptStatus.PENDING })])
    expect(pending.get('tbody').text()).toContain(t('staff.receiptStatus.pending'))

    const confirmed = mountTable([makeReceipt({ status: ReceiptStatus.CONFIRMED })])
    expect(confirmed.get('tbody').text()).toContain(t('staff.receiptStatus.confirmed'))

    const rejected = mountTable([makeReceipt({ status: ReceiptStatus.REJECTED })])
    expect(rejected.get('tbody').text()).toContain(t('staff.receiptStatus.rejected'))
    expect(rejected.get('tbody').html()).toContain('bg-danger-soft')
  })

  it('uses the empty text from staff.empty.receipts', () => {
    expect(mountTable([]).text()).toContain(t('staff.empty.receipts'))
  })
})
