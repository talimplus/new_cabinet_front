import { describe, it, expect } from 'vitest'
import { getTotalSalary, getBaseSalary, getRemaining, hasTeachers, getRoleLabel } from '../payroll-salary'
import { PayrollStatus } from '../../enums/payroll-status.enum'
import { t } from '@/locales'
import type { StaffSalary } from '../../interfaces/staff-salary.interface'
import type { StaffUser } from '../../interfaces/staff-user.interface'

function makeSalary(overrides: Partial<StaffSalary> = {}): StaffSalary {
  return {
    id: 1,
    userId: 10,
    forMonth: '2026-09',
    baseSalary: 2_000_000,
    paidAmount: 0,
    status: PayrollStatus.UNPAID,
    paidAt: null,
    comment: null,
    createdAt: '2026-01-01',
    user: makeUser(),
    ...overrides,
  }
}

function makeUser(overrides: Partial<StaffUser> = {}): StaffUser {
  return {
    id: 10,
    firstName: 'Ali',
    lastName: 'Valiyev',
    login: 'ali',
    phone: '998',
    role: 'manager',
    salary: 2_000_000,
    commissionPercentage: null,
    createdAt: '2026-01-01',
    ...overrides,
  }
}

describe('getTotalSalary', () => {
  it('uses earningTotalEarning for a teacher', () => {
    expect(getTotalSalary(makeSalary({ baseSalary: 1_000_000, earningTotalEarning: 1_800_000 }))).toBe(
      1_800_000,
    )
  })

  it('falls back to baseSalary when there is no earning record', () => {
    expect(getTotalSalary(makeSalary({ baseSalary: 1_000_000 }))).toBe(1_000_000)
  })
})

describe('getBaseSalary', () => {
  it('uses the teacher base-salary snapshot when present', () => {
    expect(
      getBaseSalary(makeSalary({ baseSalary: 1_000_000, earningBaseSalarySnapshot: 900_000 })),
    ).toBe(900_000)
  })

  it('falls back to baseSalary without a snapshot', () => {
    expect(getBaseSalary(makeSalary({ baseSalary: 1_000_000 }))).toBe(1_000_000)
  })
})

describe('getRemaining', () => {
  it('returns the backend remaining even when it disagrees with the arithmetic', () => {
    // total 2M, deduction 200k, paid 0 → arithmetic would say 1.8M, but the
    // backend's own figure always wins when present.
    const s = makeSalary({ baseSalary: 2_000_000, deductionAmount: 200_000, paidAmount: 0, remaining: 999 })
    expect(getRemaining(s)).toBe(999)
  })

  it('falls back to total − deductionAmount − paidAmount when remaining is absent', () => {
    const s = makeSalary({ baseSalary: 2_000_000, deductionAmount: 200_000, paidAmount: 300_000 })
    expect(getRemaining(s)).toBe(2_000_000 - 200_000 - 300_000)
  })

  it('treats a missing deductionAmount as zero in the fallback', () => {
    const s = makeSalary({ baseSalary: 2_000_000, paidAmount: 500_000 })
    expect(getRemaining(s)).toBe(2_000_000 - 500_000)
  })
})

describe('hasTeachers', () => {
  it('is true when some row has an earningTotalEarning', () => {
    expect(hasTeachers([makeSalary(), makeSalary({ earningTotalEarning: 1_000_000 })])).toBe(true)
  })

  it('is false when no row is a teacher', () => {
    expect(hasTeachers([makeSalary(), makeSalary()])).toBe(false)
  })

  it('is false for an empty list', () => {
    expect(hasTeachers([])).toBe(false)
  })
})

describe('getRoleLabel', () => {
  it('prefers the admin-defined role name', () => {
    const user = makeUser({ role: 'manager', userRole: { id: 1, key: 'kassir', name: 'Kassir' } })
    expect(getRoleLabel(user)).toBe('Kassir')
  })

  it('translates a known base role through payroll.roles.*', () => {
    const user = makeUser({ role: 'manager', userRole: null })
    expect(getRoleLabel(user)).toBe(t('payroll.roles.manager'))
  })

  it('maps super_admin to the superAdmin key', () => {
    const user = makeUser({ role: 'super_admin', userRole: null })
    expect(getRoleLabel(user)).toBe(t('payroll.roles.superAdmin'))
  })

  it('falls back to the raw string for an unknown role', () => {
    const user = makeUser({ role: 'mystery_role', userRole: null })
    expect(getRoleLabel(user)).toBe('mystery_role')
  })
})
