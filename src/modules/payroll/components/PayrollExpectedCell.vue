<template>
  <div v-if="f && (f.pendingShare > 0 || f.unpaidShare > 0)" class="text-xs">
    <div v-if="f.pendingShare > 0" class="whitespace-nowrap font-mono text-info">
      {{ t('payroll.expected.pending', { amount: formatMoney(f.pendingShare) }) }}
    </div>
    <div v-if="f.unpaidShare > 0" class="whitespace-nowrap font-mono text-muted-foreground">
      {{ t('payroll.expected.unpaid', { amount: formatMoney(f.unpaidShare) }) }}
    </div>
    <div class="mt-0.5 whitespace-nowrap font-mono font-semibold text-foreground">
      {{ t('payroll.expected.estimate', { amount: formatSom(f.estimate) }) }}
    </div>
  </div>
  <span v-else class="font-mono text-muted-foreground">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatMoney, formatSom } from '@/shared/utils/format-money'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

/**
 * Teachers: the share of this month's student payments that is still coming —
 * waiting for the admin's confirmation and not paid yet — and the salary if
 * everything gets paid. The owner sizes an advance from this.
 */
const props = defineProps<{ staff: StaffSalary }>()
const f = computed(() => props.staff.forecast ?? null)
</script>
