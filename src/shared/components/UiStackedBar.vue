<template>
  <div class="space-y-2">
    <!-- 100% bar: one segment per state, a 2px surface gap between fills. -->
    <div class="flex h-3 w-full items-center gap-0.5" role="group" :aria-label="summary">
      <span v-if="!visible.length" class="h-3 w-full rounded-full bg-surface-muted" />
      <!-- The hit area is twice the bar's height; the painted fill sits in its middle. -->
      <span
        v-for="(s, i) in visible"
        :key="s.key"
        class="group flex h-6 min-w-1 cursor-default items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        :style="{ width: `${pct(s.value)}%` }"
        role="img"
        tabindex="0"
        :aria-label="describe(s)"
        v-bind="tip.bind(() => tooltip(s))"
      >
        <span
          :class="cn(
            'h-3 w-full transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80',
            FILLS[s.tone],
            i === 0 && 'rounded-l-full',
            i === visible.length - 1 && 'rounded-r-full',
          )"
        />
      </span>
    </div>
    <!-- Legend always present: identity never rides on color alone. -->
    <ul v-if="legend" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li v-for="s in segments" :key="s.key" class="flex items-center gap-1.5">
        <span :class="cn('h-2.5 w-2.5 shrink-0 rounded-sm', FILLS[s.tone])" />
        <span>{{ s.label }}</span>
        <span class="font-mono font-semibold text-foreground">{{ s.display ?? s.value }}</span>
        <span v-if="total" class="font-mono">({{ pct(s.value) }}%)</span>
      </li>
    </ul>
    <UiChartTooltip :data="tip.data.value" :anchor="tip.anchor.value" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiChartTooltip from './UiChartTooltip.vue'
import { cn } from '@/shared/utils/cn'
import { useChartTooltip } from '@/shared/composables/use-chart-tooltip'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'

interface Props {
  segments: StackedSegment[]
  /** Show the legend under the bar (default true). */
  legend?: boolean
  /** Tooltip heading — what the whole bar is (a group name, "this month"…). */
  title?: string
}
const props = withDefaults(defineProps<Props>(), { legend: true, title: undefined })

const FILLS: Record<StackedSegment['tone'], string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-fg-subtle',
}

const tip = useChartTooltip()
const total = computed(() => props.segments.reduce((sum, s) => sum + Math.max(0, s.value), 0))
const visible = computed(() => props.segments.filter((s) => s.value > 0))
const pct = (v: number): number => (total.value ? Math.round((v / total.value) * 1000) / 10 : 0)
const describe = (s: StackedSegment): string => `${s.label}: ${s.display ?? s.value} (${pct(s.value)}%)`
/** Screen readers get the whole bar as one sentence. */
const summary = computed(() => props.segments.map((s) => `${s.label}: ${s.display ?? s.value}`).join(', '))

const tooltip = (s: StackedSegment): ChartTooltipData => ({
  title: props.title,
  rows: [{ key: s.key, label: s.label, value: s.display ?? String(s.value), share: `${pct(s.value)}%`, fill: FILLS[s.tone] }],
})
</script>
