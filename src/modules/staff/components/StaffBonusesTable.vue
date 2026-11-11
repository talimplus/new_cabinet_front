<template>
  <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.bonuses')">
    <template #cell-forMonth="{ row }">
      <span class="font-mono">{{ formatMonth((row as StaffBonusRow).forMonth) }}</span>
    </template>
    <template #cell-amount="{ row }">
      <span class="font-mono font-medium text-success">+{{ formatSom((row as StaffBonusRow).amount) }}</span>
    </template>
    <template #cell-author="{ row }">
      <StaffAuthorCell :author="(row as StaffBonusRow).createdBy" :created-at="(row as StaffBonusRow).createdAt" />
    </template>
    <template #actions="{ row }">
      <UiIconButton
        v-if="canManage"
        :icon="Trash2"
        tone="danger"
        :label="t('common.delete')"
        :disabled="busy"
        @click="emit('remove', row as StaffBonusRow)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiIconButton } from '@/shared/components'
import { Trash2 } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import StaffAuthorCell from './StaffAuthorCell.vue'
import type { StaffBonusRow } from '../interfaces/staff-pay-extras.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

/** `canManage` = an admin with `payroll.pay`; the employee's own page only reads. */
defineProps<{ rows: StaffBonusRow[]; canManage?: boolean; busy?: boolean }>()
const emit = defineEmits<{ remove: [row: StaffBonusRow] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'forMonth', label: t('staff.table.month'), primary: true },
  { key: 'amount', label: t('staff.table.amount'), align: 'right' },
  { key: 'reason', label: t('staff.table.reason') },
  { key: 'author', label: t('staff.table.author') },
])
</script>
