<template>
  <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.deductions')">
    <template #cell-sourceForMonth="{ row }">
      <span class="font-mono">{{ formatMonth((row as StaffDeductionRow).sourceForMonth) }}</span>
    </template>
    <template #cell-amount="{ row }">
      <span class="font-mono font-medium text-danger">{{ formatSom((row as StaffDeductionRow).amount) }}</span>
    </template>
    <!-- Anything left here still comes off future salaries. -->
    <template #cell-remainingAmount="{ row }">
      <span v-if="(row as StaffDeductionRow).remainingAmount > 0" class="font-mono text-warning">
        {{ formatSom((row as StaffDeductionRow).remainingAmount) }}
      </span>
      <UiBadge v-else variant="success">{{ t('staff.deduction.settled') }}</UiBadge>
    </template>
    <template #cell-type="{ row }">
      {{ t(DEDUCTION_TYPE_LABEL_KEYS[(row as StaffDeductionRow).type]) }}
    </template>
    <template #actions="{ row }">
      <UiIconButton
        v-if="canDeduct"
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
import { DEDUCTION_TYPE_LABEL_KEYS } from '../enums/staff-deduction-type.enum'
import type { StaffDeductionRow } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: StaffDeductionRow[]; canDeduct?: boolean; busy?: boolean }>()
const emit = defineEmits<{ remove: [row: StaffDeductionRow] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'sourceForMonth', label: t('staff.table.month'), primary: true },
  { key: 'amount', label: t('staff.table.amount'), align: 'right' },
  { key: 'remainingAmount', label: t('staff.table.remainingDeduction'), align: 'right' },
  { key: 'type', label: t('staff.table.reasonType') },
  { key: 'reason', label: t('staff.table.reason') },
])
</script>
