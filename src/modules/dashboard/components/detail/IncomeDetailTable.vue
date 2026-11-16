<template>
  <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('statistics.detail.empty')" :row-click="rowClick">
    <template #cell-date="{ row }"><span class="font-mono whitespace-nowrap">{{ formatDate(r(row).date) }}</span></template>
    <template #cell-student="{ row }">
      <span class="font-medium">{{ r(row).studentName }}</span>
      <span class="block text-xs text-muted-foreground">{{ r(row).groupName ?? '—' }}</span>
    </template>
    <template #cell-forMonth="{ row }"><span class="font-mono">{{ formatMonth(r(row).forMonth) }}</span></template>
    <template #cell-method="{ row }">{{ methodLabel(r(row).method) }}</template>
    <template #cell-receivedBy="{ row }">{{ r(row).receivedBy ?? '—' }}</template>
    <template #cell-amount="{ row }"><span class="font-mono font-semibold whitespace-nowrap text-success">{{ formatSom(r(row).amount) }}</span></template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { formatMonth } from '@/shared/utils/format-month'
import { formatSom } from '@/shared/utils/format-money'
import { PaymentMethod, PAYMENT_METHOD_LABEL_KEYS } from '@/shared/enums/payment-method.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { StatsIncomeRow } from '../../interfaces/stats-details.interface'

const { t } = useI18n()
const props = defineProps<{ rows: Record<string, unknown>[]; loading?: boolean; canOpen?: boolean }>()
const emit = defineEmits<{ open: [studentId: number] }>()

const r = (row: unknown) => row as StatsIncomeRow
const rowClick = computed(() => (props.canOpen ? (row: Record<string, unknown>) => emit('open', r(row).studentId) : undefined))
const methodLabel = (m: string | null): string =>
  m && m in PAYMENT_METHOD_LABEL_KEYS ? t(PAYMENT_METHOD_LABEL_KEYS[m as PaymentMethod]) : '—'

const columns = computed<TableColumn[]>(() => [
  { key: 'student', label: t('statistics.detail.col.student'), primary: true },
  { key: 'date', label: t('statistics.detail.col.paidOn') },
  { key: 'forMonth', label: t('statistics.detail.col.forMonth') },
  { key: 'method', label: t('statistics.detail.col.method') },
  { key: 'receivedBy', label: t('statistics.detail.col.receivedBy') },
  { key: 'amount', label: t('statistics.detail.col.amount'), align: 'right' },
])
</script>
