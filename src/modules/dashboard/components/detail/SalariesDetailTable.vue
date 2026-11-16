<template>
  <UiTable :columns="columns" :rows="keyed" row-key="key" :loading="loading" :empty-text="t('statistics.detail.empty')" :row-click="rowClick">
    <template #cell-fullName="{ row }"><span class="font-medium">{{ r(row).fullName }}</span></template>
    <template #cell-kind="{ row }">
      <UiBadge :variant="r(row).kind === SalaryEntryKind.ADVANCE ? 'warning' : 'info'">{{ t(SALARY_ENTRY_KIND_LABEL_KEYS[r(row).kind]) }}</UiBadge>
    </template>
    <template #cell-date="{ row }"><span class="font-mono whitespace-nowrap">{{ formatDate(r(row).date) }}</span></template>
    <template #cell-forMonth="{ row }"><span class="font-mono">{{ formatMonth(r(row).forMonth) }}</span></template>
    <template #cell-comment="{ row }"><span class="text-muted-foreground">{{ r(row).comment || '—' }}</span></template>
    <template #cell-amount="{ row }"><span class="font-mono font-semibold whitespace-nowrap">{{ formatSom(r(row).amount) }}</span></template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiTable } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import { formatMonth } from '@/shared/utils/format-month'
import { formatSom } from '@/shared/utils/format-money'
import { SalaryEntryKind, SALARY_ENTRY_KIND_LABEL_KEYS } from '../../enums/salary-entry-kind.enum'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { StatsSalaryRow } from '../../interfaces/stats-details.interface'

const { t } = useI18n()
const props = defineProps<{ rows: Record<string, unknown>[]; loading?: boolean; canOpen?: boolean }>()
const emit = defineEmits<{ open: [userId: number] }>()

const r = (row: unknown) => row as StatsSalaryRow
// A salary payment and an advance can share an id — key on both.
const keyed = computed(() => props.rows.map((x) => ({ ...x, key: `${x.kind}-${x.id}` })))
const rowClick = computed(() => (props.canOpen ? (row: Record<string, unknown>) => emit('open', r(row).userId) : undefined))
const columns = computed<TableColumn[]>(() => [
  { key: 'fullName', label: t('statistics.detail.col.employee'), primary: true },
  { key: 'kind', label: t('statistics.detail.col.kind') },
  { key: 'date', label: t('statistics.detail.col.givenOn') },
  { key: 'forMonth', label: t('statistics.detail.col.workMonth') },
  { key: 'comment', label: t('statistics.detail.col.comment'), hideOnMobile: true },
  { key: 'amount', label: t('statistics.detail.col.amount'), align: 'right' },
])
</script>
