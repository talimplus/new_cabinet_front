import { t } from '@/locales'

/** Format a UZS amount with space thousands separators, e.g. 48200000 → "48 200 000". */
export function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value)
}

/** Full sum with the translated currency suffix, e.g. "48 200 000 so'm" / "… сум". */
export function formatSom(value: number | null | undefined): string {
  const formatted = formatMoney(value)
  return formatted === '—' ? formatted : `${formatted} ${t('common.sum')}`
}

/** Compact sum for tiles, e.g. 48200000 → "48.2M", 12500 → "12.5k". */
export function formatMoneyShort(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—'
  if (Math.abs(value) >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (Math.abs(value) >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
}
