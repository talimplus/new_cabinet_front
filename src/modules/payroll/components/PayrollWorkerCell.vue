<template>
  <div class="min-w-0">
    <span class="font-medium">{{ staff.user.firstName }} {{ staff.user.lastName }}</span>
    <!-- Only when there is an advance debt — it comes off the next salary. -->
    <div v-if="debt > 0" class="mt-0.5 text-xs text-warning">
      {{ t('payroll.advanceDebt', { amount: formatSom(debt) }) }}
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
const debt = computed(() => props.staff.advanceOutstanding ?? 0)
</script>
