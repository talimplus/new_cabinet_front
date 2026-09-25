import type { Center } from '@/modules/centers/interfaces/center.interface'

export interface MonthOption {
  /** Two-digit month, e.g. "01" — combined with the year into `forMonth`. */
  value: string
  /** i18n key — the caller translates it. */
  labelKey: string
}

/** Month options; index 0 = January. Value is the `MM` used in `forMonth`. */
export const PAYROLL_MONTHS: MonthOption[] = Array.from({ length: 12 }, (_, i) => {
  const value = String(i + 1).padStart(2, '0')
  return { value, labelKey: `common.months.${value}` }
})

/**
 * The month a center opened — there is no payroll before it. With "all
 * centers" selected the earliest of them wins; with none known we fall back to
 * a year ago so the picker is never empty.
 */
export function earliestOpening(centers: Center[], activeCenterId: number | null): Date {
  const pick = activeCenterId ? centers.filter((c) => c.id === activeCenterId) : centers
  const dates = pick
    .map((c) => (c.createdAt ? new Date(c.createdAt) : null))
    .filter((d): d is Date => !!d && !Number.isNaN(d.getTime()))

  if (!dates.length) {
    const fallback = new Date()
    fallback.setFullYear(fallback.getFullYear() - 1)
    return fallback
  }
  return dates.reduce((min, d) => (d < min ? d : min))
}

/** Years from the center's opening year up to the current one, newest first. */
export function buildYearOptions(opened: Date, today = new Date()): number[] {
  const from = Math.min(opened.getFullYear(), today.getFullYear())
  const count = today.getFullYear() - from + 1
  return Array.from({ length: count }, (_, i) => today.getFullYear() - i)
}

/**
 * The months a year can actually hold payroll for: it starts at the opening
 * month in the opening year and stops at the current month in the current year.
 */
export function buildMonthOptions(year: number, opened: Date, today = new Date()): MonthOption[] {
  // Outside the center's lifetime there is nothing to show at all.
  if (year < opened.getFullYear() || year > today.getFullYear()) return []
  const start = year === opened.getFullYear() ? opened.getMonth() : 0
  const end = year === today.getFullYear() ? today.getMonth() + 1 : 12
  return start >= end ? [] : PAYROLL_MONTHS.slice(start, end)
}
