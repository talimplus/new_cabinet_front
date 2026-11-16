<template>
  <div class="space-y-3">
    <div class="flex items-start gap-2">
      <UiBackButton :fallback="{ name: 'dashboard', query }" />
      <div class="min-w-0">
        <h1 class="text-lg font-bold text-foreground">{{ t(STATS_DETAIL_TITLE_KEYS[kind]) }}</h1>
        <p class="text-xs text-muted-foreground">{{ t(STATS_DETAIL_HINT_KEYS[kind]) }}</p>
      </div>
    </div>
    <div class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-surface p-3 shadow-card">
      <p class="text-sm text-muted-foreground">
        {{ t('statistics.detail.total', { count: summary.count }) }}
        <span v-if="showAmount" class="ml-1 font-mono font-semibold text-foreground">{{ formatSom(summary.amount) }}</span>
      </p>
      <UiSpinner v-if="loading" :size="16" class="text-muted-foreground" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBackButton, UiSpinner } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { StatsDetailKind, STATS_DETAIL_HINT_KEYS, STATS_DETAIL_TITLE_KEYS } from '../enums/stats-detail-kind.enum'

const { t } = useI18n()
const props = defineProps<{
  kind: StatsDetailKind
  query: Record<string, string>
  summary: { count: number; amount: number }
  loading?: boolean
}>()
const showAmount = computed(() => props.kind !== StatsDetailKind.STUDENTS)
</script>
