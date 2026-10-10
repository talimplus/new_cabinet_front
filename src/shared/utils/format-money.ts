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

/**
 * Text typed into an amount field → its canonical form: digits only, `,` read
 * as the decimal point, at most 2 decimals, leading zeros dropped. Spaces and
 * letters are ignored, so `100 000`, `100000` and `100.000,5` all parse.
 */
export function cleanAmountText(raw: string): string {
  const text = raw.replace(/,/g, '.').replace(/[^\d.]/g, '')
  const dot = text.indexOf('.')
  const intPart = (dot === -1 ? text : text.slice(0, dot)).replace(/\./g, '').replace(/^0+(?=\d)/, '')
  if (dot === -1) return intPart
  const decimals = text.slice(dot + 1).replace(/\./g, '').slice(0, 2)
  return `${intPart || '0'}.${decimals}`
}

/** `1000000.5` → `1 000 000.5` — the grouped text an amount field shows while typing. */
export function groupAmountText(clean: string): string {
  const [intPart = '', decimals] = clean.split('.')
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  return decimals === undefined ? grouped : `${grouped}.${decimals}`
}

/** Canonical amount text → number, '' for an empty field. */
export function amountTextToValue(clean: string): number | '' {
  if (clean === '' || clean === '.') return ''
  const n = Number(clean)
  return Number.isNaN(n) ? '' : n
}

/** A stored amount (number, or a numeric string like "500000.00") → field text. */
export function amountToText(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (Number.isNaN(n)) return ''
  return groupAmountText(cleanAmountText(String(Math.round(n * 100) / 100)))
}
