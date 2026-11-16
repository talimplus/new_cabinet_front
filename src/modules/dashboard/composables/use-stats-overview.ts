import { ref } from 'vue'
import { fetchStatsOverview } from '../api/statistics.api'
import { useDateRange } from './use-date-range'
import type { StatsOverviewResponse } from '../interfaces/stats-overview.interface'

/** State of the statistics page: its period (in the URL) and the overview figures. */
export function useStatsOverview() {
  const data = ref<StatsOverviewResponse | null>(null)
  const loading = ref(false)
  let seq = 0
  const period = useDateRange(() => void load())

  async function load(): Promise<void> {
    const mine = ++seq
    loading.value = true
    try {
      const res = await fetchStatsOverview({ ...period.range })
      if (mine === seq) data.value = res
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  return { data, loading, period, load }
}
