<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
import { Clock, Ban, ReceiptText, Coins, HandCoins, Gift } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import type { StaffOverviewSummary } from '../interfaces/staff-overview.interface'

const { t } = useI18n()

const props = defineProps<{ summary: StaffOverviewSummary }>()

const cards = computed(() => {
  const s = props.summary
  return [
    {
      label: t('staff.stats.lateDays'),
      value: String(s.lateDays),
      hint: undefined as string | undefined,
      icon: Clock,
      tone: 'warning' as const,
    },
    {
      label: t('staff.stats.missedDays'),
      value: String(s.missedDays),
      hint: t('staff.stats.missedHint', { days: s.expectedDays }),
      icon: Ban,
      tone: 'danger' as const,
    },
    {
      // Money they took that an admin has not confirmed — still their liability.
      label: t('staff.stats.unsettled'),
      value: formatSom(s.unsettledAmount),
      hint: t('staff.stats.unsettledHint', { count: s.unsettledCount }),
      icon: ReceiptText,
      tone: 'info' as const,
    },
    {
      label: t('staff.stats.deduction'),
      value: formatSom(s.deductionThisMonth),
      hint: t('staff.stats.deductionHint', { amount: formatSom(s.deductionOutstanding) }),
      icon: Coins,
      tone: 'primary' as const,
    },
    {
      // An advance is not a fine: money already handed over, withheld later.
      label: t('staff.stats.advance'),
      value: formatSom(s.advanceThisMonth ?? 0),
      hint: t('staff.stats.advanceHint', { amount: formatSom(s.advanceOutstanding ?? 0) }),
      icon: HandCoins,
      tone: 'neutral' as const,
    },
    {
      label: t('staff.stats.bonus'),
      value: formatSom(s.bonusThisMonth ?? 0),
      hint: t('staff.stats.bonusHint'),
      icon: Gift,
      tone: 'success' as const,
    },
  ]
})
</script>
