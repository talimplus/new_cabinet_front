<template>
  <UiTable
    :columns="columns"
    :rows="(rows as unknown as Record<string, unknown>[])"
    :loading="loading"
    :row-class="tint"
    :empty-text="t('payroll.emptyState')"
    :row-click="(row) => emit('details', row as unknown as StaffSalary)"
  >
    <template #cell-worker="{ row }"><PayrollWorkerCell :staff="row as StaffSalary" /></template>
    <template #cell-role="{ row }">{{ getRoleLabel((row as StaffSalary).user) }}</template>
    <template #cell-calculated="{ row }"><PayrollCalculatedCell :staff="row as StaffSalary" /></template>
    <template #cell-expected="{ row }"><PayrollExpectedCell :staff="row as StaffSalary" /></template>
    <template #cell-advance="{ row }">
      <PayrollAdvanceCell :staff="row as StaffSalary" :can-pay="canPay" @carry="emit('carry', $event)" />
    </template>
    <template #cell-fines="{ row }">
      <PayrollMoney :value="getFine(row as StaffSalary)" tone="minus" />
    </template>
    <template #cell-paid="{ row }"><PayrollMoney :value="(row as StaffSalary).paidAmount" /></template>
    <template #cell-remaining="{ row }">
      <PayrollMoney :value="getRemaining(row as StaffSalary)" tone="strong" />
    </template>
    <template #cell-status="{ row }">
      <UiBadge :variant="PAYROLL_DISPLAY_VARIANTS[getDisplayStatus(row as StaffSalary)]">
        {{ t(PAYROLL_DISPLAY_LABEL_KEYS[getDisplayStatus(row as StaffSalary)]) }}
      </UiBadge>
    </template>
    <template #actions="{ row }">
      <PayrollRowActions
        :staff="row as StaffSalary"
        :can-pay="canPay"
        :can-view-staff="canViewStaff"
        @pay="emit('pay', $event)"
        @details="emit('details', $event)"
        @open-staff="emit('open-staff', $event)"
        @advance="emit('advance', $event)"
        @bonus="emit('bonus', $event)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import { getDisplayStatus, getFine, getRemaining, getRoleLabel } from '../utils/payroll-salary'
import {
  PAYROLL_DISPLAY_LABEL_KEYS,
  PAYROLL_DISPLAY_TINTS,
  PAYROLL_DISPLAY_VARIANTS,
} from '../enums/payroll-display-status.enum'
import { buildPayrollColumns } from '../config/payroll-columns'
import PayrollMoney from './PayrollMoney.vue'
import PayrollWorkerCell from './PayrollWorkerCell.vue'
import PayrollCalculatedCell from './PayrollCalculatedCell.vue'
import PayrollExpectedCell from './PayrollExpectedCell.vue'
import PayrollAdvanceCell from './PayrollAdvanceCell.vue'
import PayrollRowActions from './PayrollRowActions.vue'
import type { StaffSalary } from '../interfaces/staff-salary.interface'

const { t } = useI18n()

defineProps<{ rows: StaffSalary[]; loading?: boolean; canPay?: boolean; canViewStaff?: boolean }>()
const emit = defineEmits<{
  pay: [staff: StaffSalary]
  details: [staff: StaffSalary]
  'open-staff': [staff: StaffSalary]
  advance: [staff: StaffSalary]
  bonus: [staff: StaffSalary]
  carry: [staff: StaffSalary]
}>()

/** The row's tint follows the status the owner reads. */
const tint = (row: Record<string, unknown>) => PAYROLL_DISPLAY_TINTS[getDisplayStatus(row as unknown as StaffSalary)]

const columns = computed(() => buildPayrollColumns())
</script>
