<template>
  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
    <UiStatCard
      v-for="card in cards"
      :key="card.label"
      :label="card.label"
      :value="card.value"
      :hint="card.hint"
      :icon="card.icon"
      :tone="card.tone"
      colored
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStatCard } from '@/shared/components'
import { CheckCircle2, Clock, XCircle, Coins } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import type { ReceiptsStatsResponse } from '../interfaces/receipts-stats.interface'

const { t } = useI18n()

const props = defineProps<{ stats: ReceiptsStatsResponse; loading?: boolean }>()

const cards = computed(() => {
  // While the numbers are in flight a dash beats a flash of stale zeroes.
  const money = (value: number): string => (props.loading ? '—' : formatSom(value))
  const count = (value: number): string => t('pendingReceipts.stats.count', { count: value })
  const s = props.stats
  return [
    {
      label: t('pendingReceipts.stats.confirmed'),
      value: money(s.confirmed.amount),
      hint: count(s.confirmed.count),
      icon: CheckCircle2,
      tone: 'success' as const,
    },
    {
      label: t('pendingReceipts.stats.pending'),
      value: money(s.pending.amount),
      hint: count(s.pending.count),
      icon: Clock,
      tone: 'warning' as const,
    },
    {
      label: t('pendingReceipts.stats.rejected'),
      value: money(s.rejected.amount),
      hint: count(s.rejected.count),
      icon: XCircle,
      tone: 'danger' as const,
    },
    {
      // total = confirmed + pending; rejected money never reached the till.
      label: t('pendingReceipts.stats.total'),
      value: money(s.total.amount),
      hint: t('pendingReceipts.stats.totalHint'),
      icon: Coins,
      tone: 'primary' as const,
    },
  ]
})
</script>
