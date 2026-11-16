<template>
  <div class="min-w-0 space-y-2">
    <ul v-if="series.length > 1" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li v-for="s in series" :key="s.key" class="flex items-center gap-1.5">
        <span :class="cn('h-0.5 w-4 shrink-0 rounded-full', s.fill, s.dashed && 'opacity-60')" />{{ s.label }}
      </li>
    </ul>
    <div class="relative h-48">
        <div v-for="tick in ticks" :key="tick" class="absolute inset-x-0 flex h-0 items-center" :style="{ bottom: `${(tick / top) * 100}%` }">
        <span class="w-10 shrink-0 pr-1.5 text-right font-mono text-[10px] text-muted-foreground">{{ axisFormat(tick) }}</span>
        <span class="flex-1 border-t border-border" />
      </div>
      <div class="absolute inset-y-0 right-0 left-10">
        <svg class="absolute inset-0 h-full w-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          <polyline
            v-for="s in series"
            :key="s.key"
            :points="path(s)"
            :class="cn('fill-none', s.stroke)"
            stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
            :stroke-dasharray="s.dashed ? '5 4' : undefined"
            vector-effect="non-scaling-stroke"
          />
        </svg>
        <div class="absolute inset-0 flex">
          <!-- The whole month band is the hit target; crosshair + dots live inside it. -->
          <div
            v-for="(c, i) in categories"
            :key="c.key"
            class="group relative h-full min-w-0 flex-1 cursor-default outline-none"
            role="img"
            tabindex="0"
            :aria-label="describe(i)"
            v-bind="tip.bind(() => tooltip(i))"
          >
            <span class="absolute inset-y-0 left-1/2 w-px bg-border opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" />
            <template v-for="s in series" :key="s.key">
              <span
                v-if="s.values[i] != null"
                :class="cn('absolute left-1/2 h-2 w-2 -translate-x-1/2 translate-y-1/2 rounded-full ring-2 ring-surface transition-transform group-hover:scale-150 group-focus-visible:scale-150', s.fill)"
                :style="{ bottom: `${((s.values[i] ?? 0) / top) * 100}%` }"
              />
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="ml-10 flex">
      <span v-for="c in categories" :key="c.key" class="min-w-0 flex-1 truncate text-center font-mono text-[10px] text-muted-foreground">{{ c.label }}</span>
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
import type { LineCategory, LineSeries } from '@/shared/interfaces/line-chart.interface'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'

interface Props {
  categories: LineCategory[]
  series: LineSeries[]
  /** Full figure for the tooltip (`1 200 000 so'm`, `85 ta`). */
  format: (value: number) => string
  /** Short y-axis label; `1.2M` style by default. */
  axisFormat?: (value: number) => string
}
const props = withDefaults(defineProps<Props>(), { axisFormat: formatCompact })

const tip = useChartTooltip()
const ticks = computed(() => niceTicks(Math.max(0, ...props.series.flatMap((s) => s.values.map((v) => v ?? 0)))))
const top = computed(() => ticks.value[ticks.value.length - 1] || 1)

/** Points at the centre of each month band, in the 0..100 viewBox. */
const path = (s: LineSeries): string => {
  const n = props.categories.length || 1
  return s.values
    .map((v, i) => (v == null ? null : `${((i + 0.5) / n) * 100},${100 - (v / top.value) * 100}`))
    .filter(Boolean)
    .join(' ')
}

const tooltip = (i: number): ChartTooltipData => ({
  title: props.categories[i]?.title ?? props.categories[i]?.label,
  rows: props.series.map((s) => {
    const v = s.values[i]
    return { key: s.key, label: s.label, value: v == null ? '—' : props.format(v), fill: s.fill }
  }),
  footer: props.categories[i]?.note,
})
const describe = (i: number): string => {
  const d = tooltip(i)
  return [d.title, ...d.rows.map((r) => `${r.label}: ${r.value}`), d.footer].filter(Boolean).join('. ')
}
</script>
