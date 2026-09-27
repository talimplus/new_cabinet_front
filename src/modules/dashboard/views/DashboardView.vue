<template>
  <div class="space-y-5">
    <DashboardFilters
      :from-month="range.fromMonth"
      :to-month="range.toMonth"
      @update:from="setFromMonth"
      @update:to="setToMonth"
    />

    <div class="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface p-4 shadow-card">
      <div class="min-w-0">
        <p class="text-xs font-medium text-muted-foreground">{{ t('statistics.netCashflow') }}</p>
        <p :class="cn('mt-1 truncate font-mono text-2xl font-bold', netTone)">{{ formatSom(data?.netCashflow) }}</p>
      </div>
      <UiSpinner v-if="loading" :size="22" class="shrink-0 text-muted-foreground" />
      <UiIcon v-else :icon="net >= 0 ? TrendingUp : TrendingDown" :size="28" :class="cn('shrink-0', netTone)" />
    </div>

    <DashboardStats :data="data" />
    <DashboardDetails :data="data" />
    <DashboardMonthly :data="data" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSpinner, UiIcon } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { TrendingUp, TrendingDown } from '@/shared/icons'
import DashboardFilters from '../components/DashboardFilters.vue'
import DashboardStats from '../components/DashboardStats.vue'
import DashboardDetails from '../components/DashboardDetails.vue'
import DashboardMonthly from '../components/DashboardMonthly.vue'
import { useDashboard } from '../composables/use-dashboard'

const { t } = useI18n()
const { data, loading, range, init, setFromMonth, setToMonth } = useDashboard()
onMounted(init)

const net = computed(() => data.value?.netCashflow ?? 0)
const netTone = computed(() => (net.value >= 0 ? 'text-success' : 'text-danger'))
</script>
