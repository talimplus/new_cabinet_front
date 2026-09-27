import { reactive, ref } from 'vue'
import { useScopeStore } from '@/stores/scope.store'
import { fetchDashboard } from '../api/statistics.api'
import type { DashboardResponse } from '../interfaces/dashboard.interface'

function ym(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Default range: the current month only. Both ends are inclusive on the
 * backend, so the old "current → next month" default summed two months.
 */
function defaultRange(): { fromMonth: string; toMonth: string } {
  const now = ym(new Date())
  return { fromMonth: now, toMonth: now }
}

export function useDashboard() {
  const scope = useScopeStore()
  const data = ref<DashboardResponse | null>(null)
  const loading = ref(false)
  const range = reactive(defaultRange())

  async function load(): Promise<void> {
    loading.value = true
    try {
      data.value = await fetchDashboard({
        fromMonth: range.fromMonth,
        toMonth: range.toMonth,
      })
    } finally {
      loading.value = false
    }
  }

  /** Fetch stats for the default period. Call on mount. */
  async function init(): Promise<void> {
    await load()
  }

  /**
   * While a single month is shown, picking a start month moves the whole view
   * to that month; a start after the end pulls the end along (the API rejects it).
   */
  async function setFromMonth(value: string): Promise<void> {
    if (!value) return
    const singleMonth = range.fromMonth === range.toMonth
    range.fromMonth = value
    if (singleMonth || range.toMonth < value) range.toMonth = value
    await load()
  }

  /** An end before the start pulls the start back to it. */
  async function setToMonth(value: string): Promise<void> {
    if (!value) return
    range.toMonth = value
    if (range.fromMonth > value) range.fromMonth = value
    await load()
  }

  return { data, loading, scope, range, init, setFromMonth, setToMonth }
}
