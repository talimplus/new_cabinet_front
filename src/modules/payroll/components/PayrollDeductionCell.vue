<template>
  <div>
    <span v-if="withheld > 0" class="font-mono text-danger">−{{ formatSom(withheld) }}</span>
    <span v-else class="text-muted-foreground">—</span>
    <!-- Didn't fit this month — it comes off the following salaries. -->
    <div v-if="outstanding > 0" class="text-xs text-warning">
      {{ t('payroll.table.outstanding', { amount: formatSom(outstanding) }) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

const props = defineProps<{ staff: StaffSalary }>()

const withheld = computed(() => props.staff.deductionAmount ?? 0)
const outstanding = computed(() => props.staff.deductionOutstanding ?? 0)
</script>
