import { computed, type Ref } from 'vue'
import { t } from '@/locales'
import type { LineCategory, LineSeries } from '@/shared/interfaces/line-chart.interface'
import type { StatsTrendPoint } from '../interfaces/stats-trend.interface'

/** Change of the last month against the first one, %; null when it can't be said. */
function change(values: number[]): number | null {
  const first = values[0] ?? 0
  const last = values[values.length - 1] ?? 0
  return values.length > 1 && first > 0 ? Math.round(((last - first) / first) * 100) : null
}

/** Axis categories + series of the payments and students history charts. */
export function useTrendCharts(points: Ref<StatsTrendPoint[]>) {
  const categories = computed<LineCategory[]>(() =>
    points.value.map((p) => {
      const mm = p.month.slice(5, 7)
      return {
        key: p.month,
        label: `${t(`common.monthsShort.${mm}`)} ${p.month.slice(2, 4)}`,
        title: `${t(`common.months.${mm}`)} ${p.month.slice(0, 4)}`,
        note: t('statistics.trend.studentsNote', { started: p.started, stopped: p.stopped }),
      }
    }),
  )
  const moneyCategories = computed(() => categories.value.map(({ note: _note, ...c }) => c))

  const moneySeries = computed<LineSeries[]>(() => [
    { key: 'income', label: t('statistics.trend.income'), stroke: 'stroke-brand', fill: 'bg-brand', values: points.value.map((p) => p.income) },
    { key: 'charged', label: t('statistics.trend.charged'), stroke: 'stroke-fg-subtle', fill: 'bg-fg-subtle', dashed: true, values: points.value.map((p) => p.charged) },
  ])
  const studentSeries = computed<LineSeries[]>(() => [
    { key: 'students', label: t('statistics.trend.students'), stroke: 'stroke-brand', fill: 'bg-brand', values: points.value.map((p) => p.students) },
  ])

  const incomeChange = computed(() => change(points.value.map((p) => p.income)))
  const studentsChange = computed(() => change(points.value.map((p) => p.students)))

  return { categories, moneyCategories, moneySeries, studentSeries, incomeChange, studentsChange }
}
