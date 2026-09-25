import type { TableColumn } from '@/shared/interfaces/table-column.interface'

/** `label` holds an i18n KEY — PaymentsView translates the columns. */
export const PAYMENT_COLUMNS: TableColumn[] = [
  { key: 'student', label: 'payments.table.student', primary: true },
  { key: 'lessons', label: 'payments.table.lessons' },
  { key: 'amountDue', label: 'payments.table.amountDue', align: 'right' },
  { key: 'amountPaid', label: 'payments.table.amountPaid', align: 'right' },
  { key: 'remainingAmount', label: 'payments.table.remaining', align: 'right' },
  { key: 'status', label: 'payments.table.status', align: 'left' },
  { key: 'pending', label: 'payments.table.pendingConfirmation', align: 'right' },
  { key: 'dueDate', label: 'payments.table.dueDate' },
  { key: 'hardDueDate', label: 'payments.table.hardDueDate' },
]
