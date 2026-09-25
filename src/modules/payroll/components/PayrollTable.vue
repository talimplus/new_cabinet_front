<template>
  <UiTable
    :columns="columns"
    :rows="(rows as unknown as Record<string, unknown>[])"
    :loading="loading"
    :row-class="statusTint"
    :empty-text="t('payroll.emptyState')"
  >
    <template #cell-worker="{ row }">
      <span class="font-medium">{{ fullName(row as StaffSalary) }}</span>
    </template>
    <template #cell-role="{ row }">{{ getRoleLabel((row as StaffSalary).user) }}</template>
    <template #cell-baseSalary="{ row }">
      <span class="font-mono">{{ formatSom(getBaseSalary(row as StaffSalary)) }}</span>
    </template>
    <template #cell-commission="{ row }">
      <span v-if="(row as StaffSalary).earningCommissionAmount != null" class="font-mono">
        {{ formatSom((row as StaffSalary).earningCommissionAmount) }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>
    <template #cell-total="{ row }">
      <span class="font-mono font-semibold">{{ formatSom(getTotalSalary(row as StaffSalary)) }}</span>
    </template>
    <template #cell-deduction="{ row }">
      <PayrollDeductionCell :staff="row as StaffSalary" />
    </template>
    <template #cell-paid="{ row }">
      <span class="font-mono">{{ formatSom((row as StaffSalary).paidAmount) }}</span>
    </template>
    <template #cell-remaining="{ row }">
      <span :class="cn('font-mono', getRemaining(row as StaffSalary) > 0 && 'font-semibold text-danger')">
        {{ formatSom(getRemaining(row as StaffSalary)) }}
      </span>
    </template>
    <template #cell-status="{ row }">
      <UiBadge :variant="PAYROLL_STATUS_VARIANTS[(row as StaffSalary).status]">
        {{ t(PAYROLL_STATUS_LABEL_KEYS[(row as StaffSalary).status]) }}
      </UiBadge>
    </template>
    <template #actions="{ row }">
      <PayrollRowActions
        :staff="row as StaffSalary"
        :can-pay="canPay"
        :can-view-staff="canViewStaff"
        @pay="emit('pay', $event)"
        @open-staff="emit('open-staff', $event)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiTable, UiBadge } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import { getTotalSalary, getBaseSalary, getRemaining, getRoleLabel } from '../utils/payroll-salary'
import {
  PayrollStatus,
  PAYROLL_STATUS_LABEL_KEYS,
  PAYROLL_STATUS_VARIANTS,
} from '../enums/payroll-status.enum'
import { buildPayrollColumns } from '../config/payroll-columns'
import PayrollDeductionCell from './PayrollDeductionCell.vue'
import PayrollRowActions from './PayrollRowActions.vue'
import type { StaffSalary } from '../interfaces/staff-salary.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  rows: StaffSalary[]
  loading?: boolean
  showCommission?: boolean
  canPay?: boolean
  canViewStaff?: boolean
}>()
const emit = defineEmits<{ pay: [staff: StaffSalary]; 'open-staff': [staff: StaffSalary] }>()

const fullName = (s: StaffSalary) => `${s.user.firstName} ${s.user.lastName}`

/** Paid / partly paid / unpaid are read at a glance from the row's tint. */
const TINTS: Record<PayrollStatus, string> = {
  [PayrollStatus.UNPAID]: 'bg-danger-soft/40',
  [PayrollStatus.PARTIAL]: 'bg-warning-soft/40',
  [PayrollStatus.PAID]: 'bg-success-soft/30',
}
const statusTint = (row: Record<string, unknown>) => TINTS[(row as unknown as StaffSalary).status]

const columns = computed(() => buildPayrollColumns(!!props.showCommission))
</script>
