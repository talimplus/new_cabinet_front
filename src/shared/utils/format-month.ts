import { t } from '@/locales'

/** Backend `forMonth` ("YYYY-MM" or "YYYY-MM-DD") → "MM.YYYY", or "—". */
export function formatMonth(value?: string | null): string {
  if (!value) return '—'
  const [year, month] = value.split('-')
  if (!year || !month) return '—'
  return `${month}.${year}`
}

/** Backend `forMonth` ("YYYY-MM" or "YYYY-MM-DD") → "Noyabr 2026" / "Ноябрь 2026", or "—". */
export function formatMonthName(value?: string | null): string {
  if (!value) return '—'
  const [year, month] = value.split('-')
  if (!year || !month) return '—'
  return `${t(`common.months.${month}`)} ${year}`
}
