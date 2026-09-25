import { reactive, ref } from 'vue'
import { useScopeStore } from '@/stores/scope.store'
import { fetchDashboard } from '../api/statistics.api'
import type { DashboardResponse } from '../interfaces/dashboard.interface'

function ym(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

/** Default range: current month → next month (matches the old app). */
function defaultRange(): { fromMonth: string; toMonth: string } {
  const now = new Date()
  return { fromMonth: ym(now), toMonth: ym(new Date(now.getFullYear(), now.getMonth() + 1, 1)) }
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

  /** Load centers (pick default), then fetch stats. Call on mount. */
  async function init(): Promise<void> {
    await load()
  }


  async function setFromMonth(value: string): Promise<void> {
    range.fromMonth = value
    await load()
  }

  async function setToMonth(value: string): Promise<void> {
    range.toMonth = value
    await load()
  }

  return { data, loading, scope, range, init, setFromMonth, setToMonth }
}
