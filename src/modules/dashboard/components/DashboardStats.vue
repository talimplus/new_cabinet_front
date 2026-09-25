<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    <UiStatCard
      v-for="tile in tiles"
      :key="tile.label"
      :label="tile.label"
      :value="tile.value"
      :icon="tile.icon"
      :tone="tile.tone"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStatCard } from '@/shared/components'
import { formatMoneyShort } from '@/shared/utils/format-money'
import { GraduationCap, TrendingUp, UserPlus, TrendingDown, Wallet, ReceiptText } from '@/shared/icons'
import type { DashboardResponse } from '../interfaces/dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ data: DashboardResponse | null }>()

const tiles = computed(() => {
  const s = props.data?.students
  const d = props.data
  return [
    { label: t('statistics.cards.students'), value: String(s?.totalCount ?? 0), icon: GraduationCap, tone: 'primary' as const },
    { label: t('statistics.cards.active'), value: String(s?.activeCount ?? 0), icon: TrendingUp, tone: 'success' as const },
    { label: t('statistics.cards.added'), value: String(s?.addedCount ?? 0), icon: UserPlus, tone: 'info' as const },
    { label: t('statistics.cards.stopped'), value: String(s?.stoppedCount ?? 0), icon: TrendingDown, tone: 'danger' as const },
    { label: t('statistics.cards.payroll'), value: formatMoneyShort(d?.payroll?.amountPaid), icon: Wallet, tone: 'warning' as const },
    { label: t('statistics.cards.expensesCount'), value: String(d?.expenses?.totalCount ?? 0), icon: ReceiptText, tone: 'info' as const },
  ]
})
</script>
