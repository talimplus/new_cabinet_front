import { computed, reactive, ref, shallowRef } from 'vue'
import { useRoute } from 'vue-router'
import { fetchStatsDetails } from '../api/statistics.api'
import { useDateRange } from './use-date-range'
import { useQueryState } from '@/shared/composables/use-query-state'
import { StatsDetailKind } from '../enums/stats-detail-kind.enum'
import { StatsIncomeStatus, STATS_INCOME_STATUS_LABEL_KEYS } from '../enums/stats-income-status.enum'
import { StatsStudentsKind, STATS_STUDENTS_KIND_LABEL_KEYS } from '../enums/stats-students-kind.enum'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'
import type { StatsDetailsParams, StatsDetailsResponse } from '../interfaces/stats-details.interface'

const PER_PAGE = 20

/**
 * An inner statistics page: the rows behind one block of the main page. The
 * period comes in the URL from the main page and can be changed here; search,
 * page and the inner tab (income status / students kind) live in the URL too.
 */
export function useStatsDetails() {
  const route = useRoute()
  const kind = computed(() => route.params.kind as StatsDetailKind)
  const res = shallowRef<StatsDetailsResponse<Record<string, unknown>> | null>(null)
  const loading = ref(false)
  let seq = 0

  const filters = reactive({
    search: '',
    page: 1,
    status: StatsIncomeStatus.CONFIRMED as StatsIncomeStatus,
    kind: StatsStudentsKind.STARTED as StatsStudentsKind,
  })
  useQueryState(filters, {
    debounce: ['search'],
    oneOf: { status: Object.values(StatsIncomeStatus), kind: Object.values(StatsStudentsKind) },
    onExternalChange: () => void load(),
  })
  const period = useDateRange(() => {
    filters.page = 1
    void load()
  })

  async function load(): Promise<void> {
    const mine = ++seq
    loading.value = true
    try {
      const params: StatsDetailsParams = {
        ...period.range,
        page: filters.page,
        perPage: PER_PAGE,
        search: filters.search.trim() || undefined,
        status: kind.value === StatsDetailKind.INCOME ? filters.status : undefined,
        kind: kind.value === StatsDetailKind.STUDENTS ? filters.kind : undefined,
      }
      const data = await fetchStatsDetails<Record<string, unknown>>(kind.value, params)
      if (mine === seq) res.value = data
    } finally {
      if (mine === seq) loading.value = false
    }
  }

  /** Inner tabs: receipt state on the income page, the student group on the students page. */
  const tabs = computed<TabItem[]>(() => {
    if (kind.value === StatsDetailKind.INCOME) {
      return Object.values(StatsIncomeStatus).map((key) => ({ key, labelKey: STATS_INCOME_STATUS_LABEL_KEYS[key] }))
    }
    if (kind.value === StatsDetailKind.STUDENTS) {
      return Object.values(StatsStudentsKind).map((key) => ({ key, labelKey: STATS_STUDENTS_KIND_LABEL_KEYS[key] }))
    }
    return []
  })
  const tab = computed(() => (kind.value === StatsDetailKind.INCOME ? filters.status : filters.kind))

  function setTab(value: string): void {
    if (kind.value === StatsDetailKind.INCOME) filters.status = value as StatsIncomeStatus
    else filters.kind = value as StatsStudentsKind
    filters.page = 1
    void load()
  }
  function setSearch(value: string): void {
    filters.search = value
    filters.page = 1
    void load()
  }
  function setPage(page: number): void {
    filters.page = page
    void load()
  }

  const rows = computed(() => res.value?.data ?? [])
  const totalPages = computed(() => res.value?.meta.totalPages ?? 1)
  const summary = computed(() => res.value?.summary ?? { count: 0, amount: 0 })

  return { kind, filters, period, loading, rows, totalPages, summary, tabs, tab, load, setTab, setSearch, setPage }
}
