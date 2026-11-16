<template>
  <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('statistics.detail.empty')">
    <template #cell-date="{ row }"><span class="font-mono whitespace-nowrap">{{ formatDate(r(row).date) }}</span></template>
    <template #cell-name="{ row }">
      <span class="font-medium">{{ r(row).name }}</span>
      <span v-if="r(row).description" class="block text-xs text-muted-foreground">{{ r(row).description }}</span>
    </template>
    <template #cell-forMonth="{ row }"><span class="font-mono">{{ formatMonth(r(row).forMonth) }}</span></template>
    <template #cell-amount="{ row }"><span class="font-mono font-semibold whitespace-nowrap text-danger">{{ formatSom(r(row).amount) }}</span></template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { formatMonth } from '@/shared/utils/format-month'
import { formatSom } from '@/shared/utils/format-money'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { StatsExpenseRow } from '../../interfaces/stats-details.interface'

const { t } = useI18n()
defineProps<{ rows: Record<string, unknown>[]; loading?: boolean }>()

const r = (row: unknown) => row as StatsExpenseRow
const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('statistics.detail.col.expense'), primary: true },
  { key: 'date', label: t('statistics.detail.col.date') },
  { key: 'forMonth', label: t('statistics.detail.col.expenseMonth') },
  { key: 'amount', label: t('statistics.detail.col.amount'), align: 'right' },
])
</script>
