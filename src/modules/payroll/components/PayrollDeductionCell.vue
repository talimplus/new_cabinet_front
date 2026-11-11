<template>
  <div>
    <!-- Fines and advances both come off this month's salary, but they are different money. -->
    <div v-if="fine > 0" class="font-mono text-danger">
      <span v-if="advance > 0" class="font-sans text-xs text-muted-foreground">{{ t('payroll.table.fine') }} </span>
      −{{ formatSom(fine) }}
    </div>
    <div v-if="advance > 0" class="font-mono text-warning">
      <span class="font-sans text-xs text-muted-foreground">{{ t('payroll.table.advance') }} </span>
      −{{ formatSom(advance) }}
    </div>
    <span v-if="fine <= 0 && advance <= 0" class="text-muted-foreground">—</span>
    <!-- Didn't fit this month — it comes off the following salaries. -->
    <div v-if="outstanding > 0" class="text-xs text-warning">
      {{ t('payroll.table.outstanding', { amount: formatSom(outstanding) }) }}
    </div>
    <div v-if="advanceOutstanding > 0" class="text-xs text-warning">
      {{ t('payroll.table.advanceOutstanding', { amount: formatSom(advanceOutstanding) }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { getAdvance, getFine } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

const props = defineProps<{ staff: StaffSalary }>()

const fine = computed(() => getFine(props.staff))
const advance = computed(() => getAdvance(props.staff))
const outstanding = computed(() => props.staff.deductionOutstanding ?? 0)
const advanceOutstanding = computed(() => props.staff.advanceOutstanding ?? 0)
</script>
