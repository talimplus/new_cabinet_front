import { t } from '@/locales'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/** Translated month names, index 0 = January. */
export function monthLabels(): string[] {
  return Array.from({ length: 12 }, (_, i) => t(`common.months.${String(i + 1).padStart(2, '0')}`))
}

/** The current month as "YYYY-MM" (local time). */
export function currentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/** "2026-09" or "2026-09-01" → "09.2026"; empty → "—". */
export function formatMonth(value?: string | null): string {
  if (!value) return '—'
  const [year, month] = value.slice(0, 7).split('-')
  if (!year || !month) return value
  return `${month}.${year}`
}

/** "YYYY-MM" options from last year up to the current month, newest first. */
export function monthOptions(): SelectOption[] {
  const now = new Date()
  const curY = now.getFullYear()
  const curM = now.getMonth() + 1
  const labels = monthLabels()
  const out: SelectOption[] = []
  for (let y = curY - 1; y <= curY; y++) {
    const maxM = y === curY ? curM : 12
    for (let m = 1; m <= maxM; m++) {
      out.push({ label: `${labels[m - 1]} ${y}`, value: `${y}-${String(m).padStart(2, '0')}` })
    }
  }
  return out.reverse()
}
