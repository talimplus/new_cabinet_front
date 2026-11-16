import { computed, reactive } from 'vue'
import { useQueryState } from '@/shared/composables/use-query-state'
import { QueryParam } from '@/shared/enums/query-param.enum'
import { toDateString, parseDate } from '@/shared/utils/format-date'
import { t } from '@/locales'
import { DatePreset } from '../enums/date-preset.enum'
import type { StatsRangeParams } from '../interfaces/stats-overview.interface'

/** The range a quick button stands for, relative to `now` (week starts on Monday). */
export function presetRange(preset: DatePreset, now = new Date()): StatsRangeParams {
  const y = now.getFullYear()
  const m = now.getMonth()
  if (preset === DatePreset.TODAY) {
    const d = toDateString(now)
    return { fromDate: d, toDate: d }
  }
  if (preset === DatePreset.WEEK) {
    const shift = (now.getDay() + 6) % 7
    const monday = new Date(y, m, now.getDate() - shift)
    const sunday = new Date(y, m, now.getDate() - shift + 6)
    return { fromDate: toDateString(monday), toDate: toDateString(sunday) }
  }
  return { fromDate: toDateString(new Date(y, m, 1)), toDate: toDateString(new Date(y, m + 1, 0)) }
}

/** Which quick button a range matches; CUSTOM when none does. */
export function matchPreset(range: StatsRangeParams, now = new Date()): DatePreset {
  for (const p of [DatePreset.TODAY, DatePreset.WEEK, DatePreset.MONTH]) {
    const r = presetRange(p, now)
    if (r.fromDate === range.fromDate && r.toDate === range.toDate) return p
  }
  return DatePreset.CUSTOM
}

/** "1–30 noyabr 2026", "16 noyabr 2026", "28 okt – 3 noy 2026". */
export function describeRange(range: StatsRangeParams): string {
  const a = parseDate(range.fromDate)
  const b = parseDate(range.toDate)
  if (!a || !b) return ''
  const month = (d: Date) => t(`common.months.${String(d.getMonth() + 1).padStart(2, '0')}`)
  if (range.fromDate === range.toDate) return `${a.getDate()} ${month(a)} ${a.getFullYear()}`
  if (a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()) {
    return `${a.getDate()}–${b.getDate()} ${month(a)} ${a.getFullYear()}`
  }
  if (a.getFullYear() === b.getFullYear()) {
    return `${a.getDate()} ${month(a)} – ${b.getDate()} ${month(b)} ${b.getFullYear()}`
  }
  return `${a.getDate()} ${month(a)} ${a.getFullYear()} – ${b.getDate()} ${month(b)} ${b.getFullYear()}`
}

/**
 * The period of the statistics page and its inner pages. It lives in the URL
 * (`?from=&to=`), so an inner page opens with the period the main page had,
 * and can then change it on its own. Default: the current month.
 */
export function useDateRange(onChange: () => void) {
  const range = reactive({ ...presetRange(DatePreset.MONTH) })
  const state = reactive({ from: range.fromDate, to: range.toDate })
  useQueryState(state, {
    kinds: { from: QueryParam.DATE_STRING, to: QueryParam.DATE_STRING },
    onExternalChange: () => {
      sync()
      onChange()
    },
  })

  function sync(): void {
    const def = presetRange(DatePreset.MONTH)
    range.fromDate = state.from || def.fromDate
    range.toDate = state.to && state.to >= range.fromDate ? state.to : range.fromDate
  }
  sync()

  function set(next: StatsRangeParams): void {
    if (!next.fromDate) return
    const to = next.toDate && next.toDate >= next.fromDate ? next.toDate : next.fromDate
    if (next.fromDate === range.fromDate && to === range.toDate) return
    range.fromDate = next.fromDate
    range.toDate = to
    state.from = range.fromDate
    state.to = range.toDate
    onChange()
  }

  const preset = computed(() => matchPreset(range))
  const label = computed(() => describeRange(range))
  /** The query to carry the period to another statistics page. */
  const query = computed(() => ({ from: range.fromDate, to: range.toDate }))

  return { range, preset, label, query, set, setPreset: (p: DatePreset) => set(presetRange(p)) }
}
