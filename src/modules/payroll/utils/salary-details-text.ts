import { t } from '@/locales'
import { formatDate } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import { monthName } from './payroll-salary'
import type { SalaryTransfer } from '../interfaces/salary-transfer.interface'
import type { SalaryWithholding } from '../interfaces/salary-details.interface'

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

/** What is left of an advance after this salary (and the ones before it). */
export function advanceLeftAfter(a: SalaryWithholding, month: string): number {
  const used = a.allocations.filter((x) => x.month <= month).reduce((s, x) => s + x.amount, 0)
  return Math.max(0, a.amount - used)
}

/**
 * Where the rest of an advance went, one sentence per other salary:
 * "Bu avansning 272 654 so'mi oktabr oyligiga sig'madi, shuning uchun noyabr
 * oyligidan ushlandi."
 */
export function advanceStory(a: SalaryWithholding, month: string): string[] {
  const lines = a.allocations
    .filter((x) => x.month !== month)
    .map((x) =>
      x.month > month
        ? t('payroll.details.advances.later', { amount: formatSom(x.amount), month: lower(month), next: lower(x.month) })
        : t('payroll.details.advances.earlier', { amount: formatSom(x.amount), month: lower(x.month) }),
    )
  if (a.notWithheld > 0) lines.push(t('payroll.details.advances.pending', { amount: formatSom(a.notWithheld) }))
  return lines
}
