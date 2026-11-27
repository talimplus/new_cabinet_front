<template>
  <section v-if="rows.length" class="rounded-lg border border-border bg-surface p-4 shadow-card">
    <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t('payroll.grid.totals') }}</h3>
    <dl class="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <div v-for="item in items" :key="item.key" class="min-w-0">
        <dt class="text-xs text-muted-foreground">{{ t(`payroll.grid.${item.key}`) }}</dt>
        <dd class="mt-1"><PayrollMoney :value="item.value" :tone="item.tone" /></dd>
      </div>
    </dl>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PayrollMoney from './PayrollMoney.vue'
import { getAdvance, getCalculated, getRemaining } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()
const props = defineProps<{ rows: StaffSalary[] }>()

const sum = (pick: (s: StaffSalary) => number) => props.rows.reduce((acc, s) => acc + pick(s), 0)

/** Under the table: what was calculated, withheld as advance, given and still to give. */
const items = computed(() => [
  { key: 'calculated', value: sum(getCalculated), tone: 'plain' as const },
  { key: 'advance', value: sum(getAdvance), tone: 'minus' as const },
  { key: 'paid', value: sum((s) => s.paidAmount), tone: 'plain' as const },
  { key: 'remaining', value: sum(getRemaining), tone: 'strong' as const },
])
</script>
