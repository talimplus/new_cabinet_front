import { t } from '@/locales'
import { formatSom } from '@/shared/utils/format-money'
import type { StaffOverviewSalary } from '../interfaces/staff-overview.interface'

export interface SalaryField {
  label: string
  value: string
  tone: string
}

/**
 * The salary composition, top to bottom: earned → + bonus → − fine → − advance
 * → = to hand over → paid → left. Bonus / fine / advance only appear when the
 * month has them; older responses without the split count everything as a fine.
 */
export function buildSalaryFields(s: StaffOverviewSalary): SalaryField[] {
  const advance = s.advanceAmount ?? 0
  const fine = s.fineAmount ?? s.deductionAmount - advance
  const bonus = s.bonusAmount ?? 0
  const optional = (label: string, amount: number, sign: string, tone: string): SalaryField[] =>
    amount > 0 ? [{ label, value: `${sign}${formatSom(amount)}`, tone }] : []

  return [
    { label: t('staff.salary.base'), value: formatSom(s.baseSalary), tone: 'text-foreground' },
    ...optional(t('staff.salary.bonus'), bonus, '+', 'text-success'),
    ...optional(t('staff.salary.fine'), fine, '−', 'text-danger'),
    ...optional(t('staff.salary.advance'), advance, '−', 'text-warning'),
    { label: t('staff.salary.net'), value: formatSom(s.netSalary), tone: 'font-semibold text-foreground' },
    { label: t('staff.salary.paid'), value: formatSom(s.paidAmount), tone: 'text-foreground' },
    {
      label: t('staff.salary.remaining'),
      value: formatSom(s.remaining),
      tone: s.remaining > 0 ? 'font-semibold text-danger' : 'text-foreground',
    },
  ]
}
