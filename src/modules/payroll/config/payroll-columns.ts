import { t } from '@/locales'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

/**
 * The payroll grid, in the order the owner reads a salary:
 * calculated − advance − deductions − given = what to hand over now.
 * Every number is one word away from its meaning; the breakdown lives on the
 * details page.
 */
export function buildPayrollColumns(): TableColumn[] {
  return [
    { key: 'worker', label: t('payroll.table.worker'), primary: true },
    { key: 'role', label: t('payroll.table.position') },
    { key: 'calculated', label: t('payroll.grid.calculated'), align: 'right' },
    { key: 'advance', label: t('payroll.grid.advance'), align: 'right' },
    { key: 'fines', label: t('payroll.grid.fines'), align: 'right' },
    { key: 'paid', label: t('payroll.grid.paid'), align: 'right' },
    { key: 'remaining', label: t('payroll.grid.remaining'), align: 'right' },
    { key: 'status', label: t('payroll.table.status') },
  ]
}
