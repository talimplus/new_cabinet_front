<template>
  <div class="space-y-4">
    <StatsDetailHeader :kind="d.kind.value" :query="d.period.query.value" :summary="d.summary.value" :loading="d.loading.value" />
    <DateRangeFilter
      :range="d.period.range"
      :preset="d.period.preset.value"
      :label="d.period.label.value"
      @preset="d.period.setPreset"
      @range="d.period.set"
    />
    <p v-if="d.kind.value === StatsDetailKind.DEBTS" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
      {{ t('statistics.detail.debts.monthsNote') }}
    </p>
    <UiTabs v-if="d.tabs.value.length" :tabs="d.tabs.value" :model-value="d.tab.value" @update:model-value="d.setTab" />
    <div class="sm:max-w-xs">
      <UiInput type="search" :model-value="d.filters.search" :placeholder="t(searchKey)" @input="onSearch">
        <template #prefix><UiIcon :icon="Search" :size="16" /></template>
      </UiInput>
    </div>
    <component :is="table" v-bind="tableProps" @open="open" />
    <UiPagination :page="d.filters.page" :total-pages="d.totalPages.value" @update:page="d.setPage" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { UiIcon, UiInput, UiPagination, UiTabs } from '@/shared/components'
import { Search } from '@/shared/icons'
import { debounce } from '@/shared/utils/debounce'
import { usePermissions } from '@/shared/composables/use-permissions'
import { StatsDetailKind } from '../enums/stats-detail-kind.enum'
import { useStatsDetails } from '../composables/use-stats-details'
import StatsDetailHeader from '../components/StatsDetailHeader.vue'
import DateRangeFilter from '../components/DateRangeFilter.vue'
import IncomeDetailTable from '../components/detail/IncomeDetailTable.vue'
import ExpensesDetailTable from '../components/detail/ExpensesDetailTable.vue'
import SalariesDetailTable from '../components/detail/SalariesDetailTable.vue'
import StudentsDetailTable from '../components/detail/StudentsDetailTable.vue'
import DebtsDetailTable from '../components/detail/DebtsDetailTable.vue'

const { t } = useI18n()
const router = useRouter()
const { canViewStudents, canViewStaffPerformance } = usePermissions()
const d = useStatsDetails()
onMounted(d.load)

const TABLES: Record<StatsDetailKind, Component> = {
  [StatsDetailKind.INCOME]: IncomeDetailTable,
  [StatsDetailKind.EXPENSES]: ExpensesDetailTable,
  [StatsDetailKind.SALARIES]: SalariesDetailTable,
  [StatsDetailKind.STUDENTS]: StudentsDetailTable,
  [StatsDetailKind.DEBTS]: DebtsDetailTable,
}
const table = computed(() => TABLES[d.kind.value])
const tableProps = computed(() => ({
  rows: d.rows.value,
  loading: d.loading.value,
  kind: d.kind.value === StatsDetailKind.STUDENTS ? d.filters.kind : undefined,
  canOpen: d.kind.value === StatsDetailKind.SALARIES ? canViewStaffPerformance.value : canViewStudents.value,
}))
const searchKey = computed(() =>
  d.kind.value === StatsDetailKind.EXPENSES ? 'statistics.detail.searchExpense'
    : d.kind.value === StatsDetailKind.SALARIES ? 'statistics.detail.searchEmployee' : 'statistics.detail.searchStudent',
)
const onSearch = debounce((ev: Event) => d.setSearch((ev.target as HTMLInputElement).value))

function open(id: number): void {
  if (d.kind.value === StatsDetailKind.SALARIES) void router.push({ name: 'staff-overview', params: { id } })
  else void router.push({ name: 'student-card', params: { id } })
}
</script>
