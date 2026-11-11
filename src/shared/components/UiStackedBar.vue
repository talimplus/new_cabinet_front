<template>
  <div class="space-y-2">
    <!-- 100% bar: one segment per state, a 2px surface gap between fills. -->
    <div
      class="flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-muted"
      role="img"
      :aria-label="summary"
    >
      <div
        v-for="s in visible"
        :key="s.key"
        :class="cn('h-full first:rounded-l-full last:rounded-r-full transition-[width]', FILLS[s.tone])"
        :style="{ width: `${pct(s.value)}%` }"
        :title="`${s.label}: ${s.display ?? s.value} (${pct(s.value)}%)`"
      />
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'

interface Props {
  segments: StackedSegment[]
  /** Show the legend under the bar (default true). */
  legend?: boolean
}
const props = withDefaults(defineProps<Props>(), { legend: true })

const FILLS: Record<StackedSegment['tone'], string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-fg-subtle',
}

const total = computed(() => props.segments.reduce((sum, s) => sum + Math.max(0, s.value), 0))
const visible = computed(() => props.segments.filter((s) => s.value > 0))
const pct = (v: number): number => (total.value ? Math.round((v / total.value) * 1000) / 10 : 0)
/** Screen readers get the whole bar as one sentence. */
const summary = computed(() => props.segments.map((s) => `${s.label}: ${s.display ?? s.value}`).join(', '))
</script>
