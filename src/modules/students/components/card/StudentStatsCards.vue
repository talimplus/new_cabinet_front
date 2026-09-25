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
import { Coins, CheckCircle2, TrendingDown, Clock, HandCoins } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import type { Component } from 'vue'
import type { StudentSummaryTotals } from '../../interfaces/student-summary.interface'

const { t } = useI18n()

const props = defineProps<{ totals: StudentSummaryTotals | null }>()

interface StatTile {
  label: string
  value: string
  hint?: string
  icon: Component
  tone: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
}

const cards = computed<StatTile[]>(() => {
  const x = props.totals
  const tiles: StatTile[] = [
    {
      label: t('students.view.stats.totalDue'),
      value: formatSom(x?.totalDue ?? 0),
      icon: Coins,
      tone: 'info',
    },
    {
      label: t('students.view.stats.totalPaid'),
      value: formatSom(x?.totalPaid ?? 0),
      icon: CheckCircle2,
      tone: 'success',
    },
    {
      label: t('students.view.stats.totalDebt'),
      value: formatSom(x?.totalDebt ?? 0),
      icon: TrendingDown,
      tone: (x?.totalDebt ?? 0) > 0 ? 'danger' : 'neutral',
    },
  ]

  // Only worth a tile when money is actually waiting on an admin.
  if ((x?.totalPending ?? 0) > 0) {
    tiles.push({
      label: t('students.view.stats.totalPending'),
      value: formatSom(x?.totalPending ?? 0),
      hint: t('students.view.stats.totalPendingHint'),
      icon: Clock,
      tone: 'warning',
    })
  }

  // The page's main figure: what the cashier should actually ask for.
  tiles.push({
    label: t('students.view.stats.payableNow'),
    value: formatSom(x?.payableNow ?? 0),
    icon: HandCoins,
    tone: 'primary',
  })
  return tiles
})
</script>
