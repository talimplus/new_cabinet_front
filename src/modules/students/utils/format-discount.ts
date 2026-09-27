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
