import { t } from '@/locales'
import { formatDate } from '@/shared/utils/format-date'
import { monthName } from './payroll-salary'
import type { SalaryTransfer } from '../interfaces/salary-transfer.interface'

const lower = (ym: string) => monthName(ym).toLowerCase()

/** Headline of a transfer: "Noyabr oyligiga o'tkazildi" / "Oktabrdan o'tdi". */
export function transferTitle(tr: SalaryTransfer, direction: 'out' | 'in'): string {
  if (direction === 'in') return t('payroll.details.transfers.in', { month: monthName(tr.fromMonth) })
  return tr.toMonth
    ? t('payroll.details.transfers.out', { month: monthName(tr.toMonth) })
    : t('payroll.details.transfers.outPending')
}

/**
 * Why the share moved, in plain words: who paid, for which month, when; and
 * that the month's salary was already closed when the payment was confirmed.
 */
export function transferReason(tr: SalaryTransfer): string[] {
  const from = lower(tr.fromMonth)
  if (!tr.student) return [t('payroll.details.transfers.reasonUnknown', { month: from })]
  const lines = [
    t('payroll.details.transfers.reasonStudent', {
      student: tr.student.name,
      group: tr.group?.name ?? '—',
      month: from,
      date: formatDate(tr.paidAt ?? tr.confirmedAt),
    }),
  ]
  if (tr.confirmedAt) {
    lines.push(
      t('payroll.details.transfers.reasonConfirmed', {
        date: formatDate(tr.confirmedAt),
        month: from,
        target: tr.toMonth ? lower(tr.toMonth) : t('payroll.details.transfers.nextSalary'),
      }),
    )
  }
  return lines
}
