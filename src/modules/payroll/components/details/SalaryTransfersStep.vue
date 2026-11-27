<template>
  <SalaryStep :n="2" :title="t('payroll.details.steps.transfers')">
    <p v-if="!items.length" class="text-sm text-muted-foreground">{{ t('payroll.details.transfers.none') }}</p>
    <ul v-else class="space-y-3">
      <li v-for="item in items" :key="`${item.direction}-${item.tr.id}`" class="rounded-md bg-surface-muted p-3 text-sm">
        <div class="flex flex-wrap items-baseline gap-x-2">
          <PayrollMoney :value="item.tr.amount" :tone="item.direction === 'out' ? 'minus' : 'plus'" class="font-semibold" />
          <span class="font-medium">{{ item.direction === 'out' ? '→' : '←' }} {{ transferTitle(item.tr, item.direction) }}</span>
        </div>
        <p v-for="(line, i) in transferReason(item.tr)" :key="i" class="mt-1 text-muted-foreground">{{ line }}</p>
      </li>
    </ul>
  </SalaryStep>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import { transferReason, transferTitle } from '../../utils/salary-details-text'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()
const props = defineProps<{ details: SalaryDetails }>()

/** Shares that left this month first (−), then the ones that came in (+). */
const items = computed(() => [
  ...props.details.transfers.out.map((tr) => ({ tr, direction: 'out' as const })),
  ...props.details.transfers.in.map((tr) => ({ tr, direction: 'in' as const })),
])
</script>
