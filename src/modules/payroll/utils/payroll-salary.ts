import { t } from '@/locales'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import type { StaffUser } from '../interfaces/staff-user.interface'
import { PayrollDisplayStatus } from '../enums/payroll-display-status.enum'
import { formatMoney } from '@/shared/utils/format-money'

/** Teachers earn a commission total (`earningTotalEarning`); others just base. */
export function getTotalSalary(s: StaffSalary): number {
  return s.earningTotalEarning ?? s.baseSalary
}

/** A teacher's base is a snapshot taken when the earning was computed. */
export function getBaseSalary(s: StaffSalary): number {
  return s.earningBaseSalarySnapshot ?? s.baseSalary
}

/**
 * What is still owed. The backend sends `remaining` with bonuses, fines and
 * advances already netted; the fallback reproduces that for older responses.
 */
export function getRemaining(s: StaffSalary): number {
  if (s.remaining !== undefined) return s.remaining
  return getTotalSalary(s) + (s.bonusAmount ?? 0) - (s.deductionAmount ?? 0) - s.paidAmount
}

/** The advance part of this month's withholding. */
export function getAdvance(s: StaffSalary): number {
  return s.advanceAmount ?? 0
}

/** The fine part of this month's withholding (older responses: all of it). */
export function getFine(s: StaffSalary): number {
  return s.fineAmount ?? (s.deductionAmount ?? 0) - getAdvance(s)
}

/** Whether any row is a teacher (drives the commission column's visibility). */
export function hasTeachers(rows: StaffSalary[]): boolean {
  return rows.some((r) => r.earningTotalEarning != null)
}

/** Roles are dynamic, so the admin-defined name wins over the base role. */
export function getRoleLabel(user: StaffUser): string {
  if (user.userRole?.name) return user.userRole.name
  const key = `payroll.roles.${user.role === 'super_admin' ? 'superAdmin' : user.role}`
  const label = t(key)
  return label === key ? user.role : label
}

/** "Hisoblangan oylik": base + commission ± transfers + bonus (fines and advances NOT taken off). */
export function getCalculated(s: StaffSalary): number {
  return (s.baseSalary ?? 0) + (s.bonusAmount ?? 0)
}

/**
 * Status in the owner's words, from the money itself:
 * nothing to pay now and cash was handed over → paid; covered only by an
 * advance → "closed by advance"; something still owed → partial / unpaid.
 */
export function getDisplayStatus(s: StaffSalary): PayrollDisplayStatus {
  const given = s.paidAmount + getAdvance(s)
  if (getRemaining(s) > 0) return given > 0 ? PayrollDisplayStatus.PARTIAL : PayrollDisplayStatus.UNPAID
  if (getCalculated(s) <= 0) return PayrollDisplayStatus.NONE
  if (s.paidAmount <= 0 && getAdvance(s) > 0) return PayrollDisplayStatus.ADVANCE
  return PayrollDisplayStatus.PAID
}

/** "Oktabr" for "2026-10-01" / "2026-10". */
export function monthName(ym: string): string {
  return t(`common.months.${ym.slice(5, 7)}`)
}

/**
 * The grey line under "Hisoblangan oylik" that adds up to it:
 * "maosh 0 + ustama 862 346 − 135 000 noyabrga o'tdi + mukofot 50 000".
 * Empty when the salary is just the fixed amount.
 */
export function calculatedNote(s: StaffSalary): string {
  const isTeacher = s.earningTotalEarning != null
  const parts: string[] = []
  const bonus = s.bonusAmount ?? 0
  if (!isTeacher && bonus <= 0) return ''
  parts.push(t('payroll.note.base', { amount: formatMoney(getBaseSalary(s)) }))
  if (isTeacher) {
    const gross = s.earningCommissionGross ?? s.earningCommissionAmount ?? 0
    parts.push(t('payroll.note.commission', { amount: formatMoney(gross) }))
    for (const tr of s.transfersOut ?? []) {
      parts.push(
        tr.toMonth
          ? t('payroll.note.out', { amount: formatMoney(tr.amount), month: monthName(tr.toMonth).toLowerCase() })
          : t('payroll.note.outPending', { amount: formatMoney(tr.amount) }),
      )
    }
    for (const tr of s.transfersIn ?? []) {
      parts.push(t('payroll.note.in', { amount: formatMoney(tr.amount), month: monthName(tr.fromMonth).toLowerCase() }))
    }
  }
  if (bonus > 0) parts.push(t('payroll.note.bonus', { amount: formatMoney(bonus) }))
  return parts.join(' ')
}
