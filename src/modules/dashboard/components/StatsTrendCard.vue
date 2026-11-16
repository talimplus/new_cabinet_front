<template>
  <section class="min-w-0 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="mb-3 flex items-start justify-between gap-2">
      <div class="min-w-0">
        <h3 class="text-sm font-semibold text-foreground">{{ title }}</h3>
        <p class="text-xs text-muted-foreground">{{ hint }}</p>
      </div>
      <UiBadge v-if="change !== null" :variant="change >= 0 ? 'success' : 'danger'">
        {{ change >= 0 ? '+' : '' }}{{ change }}%
      </UiBadge>
    </div>
    <UiLineChart :categories="categories" :series="series" :format="format" />
  </section>
</template>

<script setup lang="ts">
import { UiBadge, UiLineChart } from '@/shared/components'
import type { LineCategory, LineSeries } from '@/shared/interfaces/line-chart.interface'

defineProps<{
  title: string
  hint: string
  categories: LineCategory[]
  series: LineSeries[]
  format: (value: number) => string
  /** Last month against the first one, %. */
  change: number | null
}>()
</script>
