import type { BaseDiscount } from '../interfaces/student.interface'
import { formatSom } from '@/shared/utils/format-money'

/**
 * "10%" or "20 000 so'm" — whichever the discount is expressed in. The backend
 * may send numerics as strings; empty/zero means no discount → null.
 */
export function formatDiscount(
  percent: number | string | null | undefined,
  amount: number | string | null | undefined,
): string | null {
  const a = Number(amount ?? 0)
  if (a > 0) return formatSom(a)
  const p = Number(percent ?? 0)
  return p > 0 ? `${p}%` : null
}

interface DiscountSource {
  baseDiscounts?: BaseDiscount[]
  discountPercent?: number | string | null
  discountAmount?: number | string | null
  discountReason?: string | null
}

/** Permanent discounts per group; without the list (older data) — the single one in the columns. */
export function permanentDiscounts(source?: DiscountSource | null): BaseDiscount[] {
  const list = source?.baseDiscounts ?? [{
    groupId: null,
    percent: Number(source?.discountPercent ?? 0),
    amount: Number(source?.discountAmount ?? 0),
    reason: source?.discountReason ?? null,
    fromMonth: null,
  }]
  return list.filter((d) => d.percent > 0 || d.amount > 0)
}
