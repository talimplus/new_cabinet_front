<template>
  <SalaryStep :n="6" :title="t('payroll.details.steps.summary')">
    <dl class="mx-auto max-w-md space-y-2 text-sm">
      <div v-for="line in lines" :key="line.key" class="flex items-baseline justify-between gap-4">
        <dt class="text-muted-foreground">{{ t(`payroll.details.summary.${line.key}`) }}</dt>
        <dd><PayrollMoney :value="line.value" :tone="line.tone" /></dd>
      </div>
      <div class="flex items-baseline justify-between gap-4 border-t border-dashed border-border pt-3">
        <dt class="font-semibold text-foreground">{{ t('payroll.details.summary.remaining') }}</dt>
        <dd><PayrollMoney :value="details.totals.remaining" tone="strong" /></dd>
      </div>
      <div v-if="details.totals.over > 0" class="flex items-baseline justify-between gap-4 text-sm text-danger">
        <dt>{{ t('payroll.details.summary.over') }}</dt>
        <dd class="font-mono">{{ formatSom(details.totals.over) }}</dd>
      </div>
      <div v-if="details.advanceDebt > 0" class="flex items-baseline justify-between gap-4 text-xs text-warning">
        <dt>{{ t('payroll.details.summary.debt') }}</dt>
        <dd class="font-mono">{{ formatSom(details.advanceDebt) }}</dd>
      </div>
    </dl>
  </SalaryStep>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
const props = defineProps<{ details: SalaryDetails }>()

/** The receipt: calculated − advance − deductions − given = left to hand over. */
const lines = computed(() => [
  { key: 'calculated', value: props.details.totals.calculated, tone: 'plain' as const },
  { key: 'advance', value: props.details.totals.advance, tone: 'minus' as const },
  { key: 'fines', value: props.details.totals.fines, tone: 'minus' as const },
  { key: 'paid', value: props.details.totals.paid, tone: 'minus' as const },
])
</script>
