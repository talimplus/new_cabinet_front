import type { TableColumn } from '@/shared/interfaces/table-column.interface'

/** `label` holds an i18n KEY — PaymentHistoryModal translates the columns. */
export const RECEIPT_COLUMNS: TableColumn[] = [
  { key: 'checkNo', label: 'payments.history.checkNo', primary: true },
  { key: 'receivedAt', label: 'payments.history.date' },
  { key: 'amount', label: 'common.amount', align: 'right' },
  { key: 'paymentMethod', label: 'payments.check.paymentMethod' },
  { key: 'status', label: 'payments.table.status' },
  { key: 'receivedBy', label: 'payments.check.receivedBy' },
  { key: 'comment', label: 'common.comment' },
]
