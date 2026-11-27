<template>
  <SalaryStep :n="4" :title="t('payroll.details.steps.advances')">
    <p v-if="!details.advances.length" class="text-sm text-muted-foreground">{{ t('payroll.details.advances.none') }}</p>
    <ul v-else class="divide-y divide-border text-sm">
      <li v-for="a in details.advances" :key="a.id" class="flex flex-wrap justify-between gap-2 py-2">
        <div class="min-w-0">
          <div class="font-mono">{{ formatDate(a.createdAt) }}</div>
          <div class="text-xs text-muted-foreground">{{ [a.reason, a.createdBy].filter(Boolean).join(' · ') }}</div>
        </div>
        <PayrollMoney :value="a.amount" />
      </li>
      <li class="flex justify-between gap-2 py-2 font-semibold">
        <span>{{ t('payroll.details.advances.total') }}</span>
        <PayrollMoney :value="total" />
      </li>
    </ul>
    <!-- Never moved on its own: warn and let the owner decide. -->
    <div v-if="details.totals.over > 0" class="mt-3 space-y-2 rounded-md bg-warning-soft p-3 text-sm text-warning">
      <p>{{ t('payroll.details.advances.over', { amount: formatSom(details.totals.over) }) }}</p>
      <UiButton v-if="canPay" size="sm" variant="outline" @click="emit('carry')">{{ t('payroll.carry.action') }}</UiButton>
    </div>
  </SalaryStep>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import SalaryStep from './SalaryStep.vue'
import PayrollMoney from '../PayrollMoney.vue'
import type { SalaryDetails } from '../../interfaces/salary-details.interface'

const { t } = useI18n()

/** The advances given FOR this month, as given — no "withheld" arithmetic. */
const props = defineProps<{ details: SalaryDetails; canPay?: boolean }>()
const emit = defineEmits<{ carry: [] }>()
const total = computed(() => props.details.advances.reduce((s, a) => s + a.amount, 0))
</script>
