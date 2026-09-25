import { t } from '@/locales'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import type { StaffUser } from '../interfaces/staff-user.interface'

/** Teachers earn a commission total (`earningTotalEarning`); others just base. */
export function getTotalSalary(s: StaffSalary): number {
  return s.earningTotalEarning ?? s.baseSalary
}

/** A teacher's base is a snapshot taken when the earning was computed. */
export function getBaseSalary(s: StaffSalary): number {
  return s.earningBaseSalarySnapshot ?? s.baseSalary
}

/**
 * What is still owed. The backend sends `remaining` with the fines already
 * subtracted; the fallback reproduces that for older responses.
 */
export function getRemaining(s: StaffSalary): number {
  if (s.remaining !== undefined) return s.remaining
  return getTotalSalary(s) - (s.deductionAmount ?? 0) - s.paidAmount
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
