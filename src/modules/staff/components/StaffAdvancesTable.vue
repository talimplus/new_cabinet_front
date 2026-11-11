<template>
  <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.advances')">
    <template #cell-sourceForMonth="{ row }">
      <span class="font-mono">{{ formatMonth((row as StaffDeductionRow).sourceForMonth) }}</span>
    </template>
    <template #cell-amount="{ row }">
      <span class="font-mono font-medium">{{ formatSom((row as StaffDeductionRow).amount) }}</span>
    </template>
    <template #cell-appliedAmount="{ row }">
      <span class="font-mono">{{ formatSom((row as StaffDeductionRow).appliedAmount) }}</span>
    </template>
    <!-- What is left still comes off the following salaries. -->
    <template #cell-remainingAmount="{ row }">
      <span v-if="(row as StaffDeductionRow).remainingAmount > 0" class="font-mono text-warning">
        {{ formatSom((row as StaffDeductionRow).remainingAmount) }}
      </span>
      <UiBadge v-else variant="success">{{ t('staff.advance.settled') }}</UiBadge>
    </template>
    <template #cell-author="{ row }">
      <StaffAuthorCell :author="(row as StaffDeductionRow).createdBy" :created-at="(row as StaffDeductionRow).createdAt" />
    </template>
    <template #actions="{ row }">
      <UiIconButton
        v-if="canManage"
        :icon="Trash2"
        tone="danger"
        :label="t('common.delete')"
        :disabled="busy"
        @click="emit('remove', row as StaffDeductionRow)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIconButton } from '@/shared/components'
import { Trash2 } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import StaffAuthorCell from './StaffAuthorCell.vue'
import type { StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

/** `canManage` = an admin with `payroll.pay`; the employee's own page only reads. */
defineProps<{ rows: StaffDeductionRow[]; canManage?: boolean; busy?: boolean }>()
const emit = defineEmits<{ remove: [row: StaffDeductionRow] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'sourceForMonth', label: t('staff.table.month'), primary: true },
  { key: 'amount', label: t('staff.table.amount'), align: 'right' },
  { key: 'appliedAmount', label: t('staff.table.deducted'), align: 'right' },
  { key: 'remainingAmount', label: t('staff.table.leftToDeduct'), align: 'right' },
  { key: 'reason', label: t('staff.table.comment') },
  { key: 'author', label: t('staff.table.author') },
])
</script>
