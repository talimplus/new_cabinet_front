<template>
  <Teleport to="body">
    <div
      v-if="data && anchor"
      ref="panel"
      role="tooltip"
      class="pointer-events-none fixed z-50 max-w-[16rem] min-w-36 rounded-md border border-border bg-surface-2 px-3 py-2 text-xs shadow-popover"
      :style="{ top: `${pos.top}px`, left: `${pos.left}px`, visibility: placed ? 'visible' : 'hidden' }"
    >
      <p v-if="data.title" class="mb-1.5 font-medium text-muted-foreground">{{ data.title }}</p>
      <ul class="space-y-1">
        <!-- Value leads (strong), the series name follows; a short line keys the series. -->
        <li v-for="row in data.rows" :key="row.key" class="flex items-center gap-2">
          <span :class="cn('h-0.5 w-3 shrink-0 rounded-full', row.fill ?? 'bg-fg-subtle')" />
          <span class="min-w-0 flex-1 truncate text-muted-foreground">{{ row.label }}</span>
          <span class="font-mono font-semibold whitespace-nowrap text-foreground">{{ row.value }}</span>
          <span v-if="row.share" class="font-mono whitespace-nowrap text-muted-foreground">{{ row.share }}</span>
        </li>
      </ul>
      <p v-if="data.footer" class="mt-1.5 border-t border-border pt-1.5 text-muted-foreground">{{ data.footer }}</p>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { cn } from '@/shared/utils/cn'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'

interface Props {
  /** What to show; null hides the tooltip. Drive it with `useChartTooltip()`. */
  data: ChartTooltipData | null
  /** The mark's box in viewport coordinates. */
  anchor: DOMRect | null
}
const props = defineProps<Props>()

const GAP = 8
const MARGIN = 8
const panel = ref<HTMLElement | null>(null)
const pos = ref({ top: 0, left: 0 })
/** Hidden until measured — no flash in the corner. */
const placed = ref(false)

/** Centred above the mark; below it when the top has no room; never past a screen edge. */
async function place(): Promise<void> {
  placed.value = false
  await nextTick()
  const a = props.anchor
  if (!a || !panel.value) return
  const { width, height } = panel.value.getBoundingClientRect()
  const left = Math.max(MARGIN, Math.min(a.left + a.width / 2 - width / 2, window.innerWidth - width - MARGIN))
  const above = a.top - GAP - height
  pos.value = { top: above >= MARGIN ? above : a.bottom + GAP, left }
  placed.value = true
}
watch(() => [props.data, props.anchor], place)
</script>
