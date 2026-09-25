<template>
  <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    <DetailCard :title="t('statistics.details.payments')" :rows="paymentRows" />
    <DetailCard :title="t('statistics.details.expenses')" :rows="expenseRows" />
    <DetailCard :title="t('statistics.details.payroll')" :rows="payrollRows" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import DetailCard from './DetailCard.vue'
import { formatSom } from '@/shared/utils/format-money'
import type { DashboardResponse } from '../interfaces/dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ data: DashboardResponse | null }>()

function pct(value = 0, total = 0): number {
  return total > 0 ? Math.round((value / total) * 100) : 0
}

const paymentRows = computed(() => {
  const p = props.data?.payments
  return [
    { label: t('statistics.details.totalDebt'), value: formatSom(p?.amountDue) },
    { label: t('statistics.details.paid'), value: formatSom(p?.amountPaid), tone: 'success' as const, percent: pct(p?.amountPaid, p?.amountDue) },
    { label: t('statistics.details.remaining'), value: formatSom(p?.remainingAmount), tone: 'danger' as const, percent: pct(p?.remainingAmount, p?.amountDue) },
  ]
})

const expenseRows = computed(() => {
  const e = props.data?.expenses
  return [
    { label: t('statistics.details.totalAmount'), value: formatSom(e?.totalAmount), tone: 'danger' as const },
    { label: t('statistics.details.totalCount'), value: String(e?.totalCount ?? 0) },
  ]
})

const payrollRows = computed(() => {
  const p = props.data?.payroll
  return [
    { label: t('statistics.details.totalDebt'), value: formatSom(p?.amountDue) },
    { label: t('statistics.details.paid'), value: formatSom(p?.amountPaid), tone: 'success' as const, percent: pct(p?.amountPaid, p?.amountDue) },
    { label: t('statistics.details.remaining'), value: formatSom(p?.remainingAmount), tone: 'danger' as const, percent: pct(p?.remainingAmount, p?.amountDue) },
  ]
})
</script>
