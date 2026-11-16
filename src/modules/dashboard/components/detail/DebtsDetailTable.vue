<template>
  <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('statistics.detail.debts.empty')" :row-click="rowClick">
    <template #cell-student="{ row }">
      <span class="font-medium">{{ r(row).studentName }}</span>
      <span class="block text-xs text-muted-foreground">{{ r(row).groupName ?? '—' }}</span>
    </template>
    <template #cell-phone="{ row }"><span class="font-mono whitespace-nowrap">{{ formatPhone(r(row).phone) || '—' }}</span></template>
    <template #cell-forMonth="{ row }"><span class="font-mono">{{ formatMonth(r(row).forMonth) }}</span></template>
    <template #cell-paid="{ row }">
      <span class="font-mono whitespace-nowrap">{{ formatSom(r(row).amountPaid) }} / {{ formatSom(r(row).amountDue) }}</span>
      <span v-if="r(row).pendingAmount > 0" class="block text-xs text-warning">
        {{ t('statistics.detail.debts.pending', { amount: formatSom(r(row).pendingAmount) }) }}
      </span>
    </template>
    <template #cell-debt="{ row }"><span class="font-mono font-semibold whitespace-nowrap text-danger">{{ formatSom(r(row).debt) }}</span></template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { formatMonth } from '@/shared/utils/format-month'
import { formatPhone } from '@/shared/utils/format-phone'
import { formatSom } from '@/shared/utils/format-money'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { StatsDebtRow } from '../../interfaces/stats-details.interface'

const { t } = useI18n()
const props = defineProps<{ rows: Record<string, unknown>[]; loading?: boolean; canOpen?: boolean }>()
const emit = defineEmits<{ open: [studentId: number] }>()

const r = (row: unknown) => row as StatsDebtRow
const rowClick = computed(() => (props.canOpen ? (row: Record<string, unknown>) => emit('open', r(row).studentId) : undefined))
const columns = computed<TableColumn[]>(() => [
  { key: 'student', label: t('statistics.detail.col.student'), primary: true },
  { key: 'phone', label: t('statistics.detail.col.phone') },
  { key: 'forMonth', label: t('statistics.detail.col.forMonth') },
  { key: 'paid', label: t('statistics.detail.col.paidOfDue'), align: 'right' },
  { key: 'debt', label: t('statistics.detail.col.debt'), align: 'right' },
])
</script>
