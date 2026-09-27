<template>
  <section v-if="months.length > 1" class="rounded-lg border border-border bg-surface p-5 shadow-card">
    <h3 class="mb-4 text-sm font-semibold text-foreground">{{ t('statistics.monthly.title') }}</h3>
    <UiTable :columns="columns" :rows="rows" row-key="key">
      <template #cell-remaining="{ value }">
        <span class="text-danger">{{ value }}</span>
      </template>
      <template #cell-net="{ row }">
        <span :class="cn('font-medium', (row as MonthRow).netTone)">{{ (row as MonthRow).net }}</span>
      </template>
    </UiTable>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { DashboardResponse } from '../interfaces/dashboard.interface'

interface MonthRow extends Record<string, unknown> {
  key: string
  month: string
  charged: string
  paid: string
  remaining: string
  expenses: string
  payroll: string
  net: string
  netTone: string
}

const { t } = useI18n()
const props = defineProps<{ data: DashboardResponse | null }>()

const months = computed(() => props.data?.byMonth ?? [])

const columns = computed<TableColumn[]>(() => [
  { key: 'month', label: t('statistics.monthly.month'), primary: true },
  { key: 'charged', label: t('statistics.monthly.charged'), align: 'right' },
  { key: 'paid', label: t('statistics.monthly.paid'), align: 'right' },
  { key: 'remaining', label: t('statistics.monthly.remaining'), align: 'right' },
  { key: 'expenses', label: t('statistics.monthly.expenses'), align: 'right' },
  { key: 'payroll', label: t('statistics.monthly.payroll'), align: 'right' },
  { key: 'net', label: t('statistics.monthly.net'), align: 'right' },
])

const rows = computed<MonthRow[]>(() =>
  months.value.map((m) => {
    const [year, mm] = m.month.split('-')
    return {
      key: m.month,
      month: `${t(`common.months.${mm}`)} ${year}`,
      charged: formatSom(m.payments.amountDue),
      paid: formatSom(m.payments.amountPaid),
      remaining: formatSom(m.payments.remainingAmount),
      expenses: formatSom(m.expenses.totalAmount),
      payroll: formatSom(m.payroll.amountPaid),
      net: formatSom(m.netCashflow),
      netTone: m.netCashflow >= 0 ? 'text-success' : 'text-danger',
    }
  }),
)
</script>
