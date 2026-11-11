<template>
  <ul class="space-y-1">
    <!-- A row is the hit target: label, the floating bar on one so'm scale, the amount. -->
    <li
      v-for="s in steps"
      :key="s.key"
      class="grid cursor-default grid-cols-[5.5rem_minmax(0,1fr)_auto] items-center gap-2 rounded-sm px-1 py-1 outline-none hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[7rem_minmax(0,1fr)_auto]"
      tabindex="0"
      role="img"
      :aria-label="`${s.label}: ${s.sign}${formatSom(s.amount)}`"
      v-bind="tip.bind(() => tooltip(s))"
    >
      <span :class="['truncate text-xs', s.total ? 'font-semibold text-foreground' : 'text-muted-foreground']">{{ s.label }}</span>
      <span class="relative h-3">
        <span
          :class="['absolute inset-y-0 rounded-sm', s.fill, s.amount > 0 && 'min-w-0.5']"
          :style="{ left: `${(s.from / scale) * 100}%`, width: `${((s.to - s.from) / scale) * 100}%` }"
        />
      </span>
      <span :class="['text-right font-mono text-xs whitespace-nowrap', s.total ? 'font-semibold text-foreground' : 'text-muted-foreground']">
        {{ s.sign }}{{ formatMoney(s.amount) }}
      </span>
    </li>
    <UiChartTooltip :data="tip.data.value" :anchor="tip.anchor.value" />
  </ul>
</template>

<script setup lang="ts">
import { toRef } from 'vue'
import { UiChartTooltip } from '@/shared/components'
import { useChartTooltip } from '@/shared/composables/use-chart-tooltip'
import { formatMoney, formatSom } from '@/shared/utils/format-money'
import { useSalarySteps } from '../composables/use-salary-steps'
import type { ChartTooltipData } from '@/shared/interfaces/chart-tooltip.interface'
import type { SalaryStep } from '../interfaces/salary-step.interface'
import type { TeacherSalaryRow } from '../interfaces/teacher-dashboard.interface'

const props = defineProps<{ row: TeacherSalaryRow }>()
const { steps, scale } = useSalarySteps(toRef(props, 'row'))
const tip = useChartTooltip()

const tooltip = (s: SalaryStep): ChartTooltipData => ({
  rows: [{ key: s.key, label: s.label, value: `${s.sign}${formatSom(s.amount)}`, fill: s.fill }],
  footer: s.hint,
})
</script>
