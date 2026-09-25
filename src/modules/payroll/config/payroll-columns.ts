import { t } from '@/locales'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

/**
 * The payroll grid. The commission column only appears when at least one row
 * is a teacher — for a center without them it is dead space.
 */
export function buildPayrollColumns(showCommission: boolean): TableColumn[] {
  const cols: TableColumn[] = [
    { key: 'worker', label: t('payroll.table.worker'), primary: true },
    { key: 'role', label: t('payroll.table.position') },
    { key: 'baseSalary', label: t('payroll.table.baseSalary'), align: 'right' },
  ]
  if (showCommission) {
    cols.push({ key: 'commission', label: t('payroll.commissionShort'), align: 'right' })
  }
  cols.push(
    { key: 'total', label: t('payroll.table.total'), align: 'right' },
    { key: 'deduction', label: t('payroll.table.deduction'), align: 'right' },
    { key: 'paid', label: t('payroll.table.paid'), align: 'right' },
    { key: 'remaining', label: t('payroll.table.remainingShort'), align: 'right' },
    { key: 'status', label: t('payroll.table.status') },
  )
  return cols
}
