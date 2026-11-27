<template>
  <div>
    <PayrollMoney :value="getAdvance(staff)" />
    <!-- Never moved silently: the owner decides whether the excess goes to next month. -->
    <div v-if="over > 0" class="mt-1 space-y-1 text-xs">
      <div class="whitespace-nowrap font-medium text-danger">{{ t('payroll.over', { amount: formatSom(over) }) }}</div>
      <UiButton v-if="canPay" size="sm" variant="outline" data-no-row-click @click.stop="emit('carry', staff)">
        {{ t('payroll.carry.action') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import PayrollMoney from './PayrollMoney.vue'
import { getAdvance } from '../utils/payroll-salary'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

/** The advances given FOR this month — all of them, even above the salary. */
const props = defineProps<{ staff: StaffSalary; canPay?: boolean }>()
const emit = defineEmits<{ carry: [staff: StaffSalary] }>()
const over = computed(() => props.staff.overAmount ?? 0)
</script>
