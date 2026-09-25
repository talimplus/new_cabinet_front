import { t } from '@/locales'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/**
 * The last 12 months, newest first, as `YYYY-MM` — the same window the old
 * cabinet offered. Labels come from `common.months`, so they follow the locale.
 */
export function buildStaffMonthOptions(from = new Date()): SelectOption[] {
  return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(from.getFullYear(), from.getMonth() - i, 1)
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    return { label: `${t(`common.months.${mm}`)} ${date.getFullYear()}`, value: `${date.getFullYear()}-${mm}` }
  })
}
