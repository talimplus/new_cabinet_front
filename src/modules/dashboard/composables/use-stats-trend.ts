import { reactive, ref } from 'vue'
import { fetchStatsTrend } from '../api/statistics.api'
import { useQueryState } from '@/shared/composables/use-query-state'
import { TrendMonths } from '../enums/trend-months.enum'
import type { StatsTrendPoint } from '../interfaces/stats-trend.interface'

/**
 * The two history charts. They have their own switch (6 months / a year) and
 * ignore the page's period on purpose — they answer "are we growing?".
 */
export function useStatsTrend() {
  const points = ref<StatsTrendPoint[]>([])
  const loading = ref(false)
  const state = reactive({ trend: TrendMonths.HALF_YEAR as TrendMonths })
  useQueryState(state, {
    oneOf: { trend: [TrendMonths.HALF_YEAR, TrendMonths.YEAR] },
    onExternalChange: () => void load(),
  })

  async function load(): Promise<void> {
    loading.value = true
    try {
      points.value = (await fetchStatsTrend({ months: state.trend })).points
    } finally {
      loading.value = false
    }
  }

  function setMonths(months: TrendMonths): void {
    if (state.trend === months) return
    state.trend = months
    void load()
  }

  return { points, loading, state, load, setMonths }
}
