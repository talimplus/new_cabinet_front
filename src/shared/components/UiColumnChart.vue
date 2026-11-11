<template>
  <div class="min-w-0 space-y-2">
    <!-- Two or more series: a legend is always there (a single series is named by the card title). -->
    <ul v-if="series.length > 1" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li v-for="s in series" :key="s.key" class="flex items-center gap-1.5">
        <span :class="cn('h-2.5 w-2.5 shrink-0 rounded-sm', s.fill)" />{{ s.label }}
      </li>
    </ul>
    <div class="relative h-40">
      <!-- One y axis, hairline solid grid; the 0 line is the baseline. -->
      <div
        v-for="tick in ticks"
        :key="tick"
        class="absolute inset-x-0 flex h-0 items-center"
        :style="{ bottom: `${(tick / top) * 100}%` }"
      >
        <span class="w-9 shrink-0 pr-1.5 text-right font-mono text-[10px] text-muted-foreground">{{ axisFormat(tick) }}</span>
        <span class="flex-1 border-t border-border" />
      </div>
      <div class="absolute inset-y-0 right-0 left-9 flex items-end">
        <!-- The whole month band is the hit target; the columns are drawn inside it. -->
        <div
          v-for="c in categories"
          :key="c.key"
          class="flex h-full min-w-0 flex-1 cursor-default items-end justify-center gap-0.5 rounded-sm px-1 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring"
          role="img"
          tabindex="0"
          :aria-label="describe(c)"
          v-bind="tip.bind(() => tooltip(c))"
        >
          <span
            v-for="(v, i) in c.values"
            :key="series[i]?.key ?? i"
            :class="cn('w-full max-w-6 rounded-t', series[i]?.fill, v && 'min-h-0.5')"
            :style="{ height: `${((v ?? 0) / top) * 100}%` }"
          />
        </div>
      </div>
    </div>
    <div class="ml-9 flex">
      <span v-for="c in categories" :key="c.key" class="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-muted-foreground">
        {{ c.label }}
      </span>
    </div>
    <UiChartTooltip :data="tip.data.value" :anchor="tip.anchor.value" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import UiChartTooltip from './UiChartTooltip.vue'
import { cn } from '@/shared/utils/cn'
import { formatCompact, niceTicks } from '@/shared/utils/chart-scale'
import { useChartTooltip } from '@/shared/composables/use-chart-tooltip'
import type { ColumnCategory, ColumnSeries } from '@/shared/interfaces/column-chart.interface'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'

interface Props {
  categories: ColumnCategory[]
  series: ColumnSeries[]
  /** Full figure for the tooltip (`1 200 000 so'm`, `85%`). */
  format: (value: number) => string
  /** Short y-axis label; `1.2M` style by default. */
  axisFormat?: (value: number) => string
  /** Fixed top of the scale (100 for shares); the data's maximum otherwise. */
  max?: number
}
const props = withDefaults(defineProps<Props>(), { axisFormat: formatCompact, max: undefined })

const tip = useChartTooltip()
const ticks = computed(() => {
  const peak = Math.max(0, ...props.categories.flatMap((c) => c.values.map((v) => v ?? 0)))
  return niceTicks(props.max ?? peak)
})
const top = computed(() => ticks.value[ticks.value.length - 1] || 1)

const tooltip = (c: ColumnCategory): ChartTooltipData => ({
  title: c.title ?? c.label,
  rows: props.series.map((s, i) => {
    const v = c.values[i]
    return { key: s.key, label: s.label, value: v == null ? '—' : props.format(v), fill: s.fill }
  }),
  footer: c.note,
})
const describe = (c: ColumnCategory): string => {
  const d = tooltip(c)
  return [d.title, ...d.rows.map((r) => `${r.label}: ${r.value}`), d.footer].filter(Boolean).join('. ')
}
</script>
