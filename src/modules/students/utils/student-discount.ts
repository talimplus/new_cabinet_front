import { DiscountType } from '../enums/discount-type.enum'
import type { Student } from '../interfaces/student.interface'
import type { DiscountPeriodForm, StudentForm } from '../interfaces/student-form.interface'

/** A discount period row while editing (months are "YYYY-MM", value may be blank). */
export interface DiscountRow {
  type: DiscountType
  value: string | number
  /** Limit to one of the student's groups; null — all groups. */
  groupId: number | null
  fromMonth: string
  toMonth: string
  reason: string
}

/** The discount block of the student form. */
export interface DiscountState {
  usePeriods: boolean
  discountType: DiscountType
  discountValue: string | number
  discountReason: string
  discountPeriods: DiscountRow[]
}

export function emptyPeriod(): DiscountRow {
  return { type: DiscountType.PERCENT, value: '', groupId: null, fromMonth: '', toMonth: '', reason: '' }
}

export function blankDiscount(): DiscountState {
  return {
    usePeriods: false,
    discountType: DiscountType.PERCENT,
    discountValue: '',
    discountReason: '',
    discountPeriods: [],
  }
}

/** Either the amount (> 0) or the percent — the backend never sets both. */
function split(percent: unknown, amount: unknown): { type: DiscountType; value: number | '' } {
  const a = Number(amount ?? 0)
  if (a > 0) return { type: DiscountType.AMOUNT, value: a }
  const p = Number(percent ?? 0)
  return { type: DiscountType.PERCENT, value: p > 0 ? p : '' }
}

/** Editing an existing student: periods win over the single (permanent) discount. */
export function discountFromStudent(student: Student): DiscountState {
  const periods = student.discountPeriods ?? []
  if (periods.length) {
    return {
      ...blankDiscount(),
      usePeriods: true,
      discountPeriods: periods.map((p) => ({
        ...split(p.percent, p.amount),
        groupId: p.groupId ?? null,
        fromMonth: (p.fromMonth ?? '').slice(0, 7),
        toMonth: (p.toMonth ?? '').slice(0, 7),
        reason: p.reason ?? '',
      })),
    }
  }
  const single = split(student.discountPercent, student.discountAmount)
  return {
    ...blankDiscount(),
    discountType: single.type,
    discountValue: single.value,
    discountReason: student.discountReason ?? '',
  }
}

function toNumber(value: string | number): number | undefined {
  if (value === '' || value === null) return undefined
  const n = Number(value)
  return Number.isNaN(n) ? undefined : n
}

/** Writes the discount fields of the POST/PUT body. */
export function applyDiscount(state: DiscountState, payload: StudentForm): void {
  if (state.usePeriods) {
    const periods: DiscountPeriodForm[] = state.discountPeriods
      .filter((p) => toNumber(p.value) !== undefined && p.fromMonth)
      .map((p) => {
        const value = Number(p.value)
        const row: DiscountPeriodForm = { fromMonth: p.fromMonth }
        if (p.type === DiscountType.AMOUNT) row.amount = value
        else row.percent = value
        if (p.groupId != null) row.groupId = p.groupId
        if (p.toMonth) row.toMonth = p.toMonth
        if (p.reason.trim()) row.reason = p.reason.trim()
        return row
      })
    if (periods.length) payload.discountPeriods = periods
    return
  }
  const value = toNumber(state.discountValue)
  if (value !== undefined) {
    // Both are sent so that switching the type on edit clears the other one.
    const isAmount = state.discountType === DiscountType.AMOUNT
    payload.discountPercent = isAmount ? 0 : value
    payload.discountAmount = isAmount ? value : 0
  }
  if (state.discountReason.trim()) payload.discountReason = state.discountReason.trim()
}
