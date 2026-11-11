<template>
  <div class="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
    <UiStatCard
      v-for="tile in tiles"
      :key="tile.label"
      :label="tile.label"
      :value="tile.value"
      :hint="tile.hint"
      :icon="tile.icon"
      :tone="tile.tone"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStatCard } from '@/shared/components'
import { GraduationCap, HandCoins, ReceiptText, Wallet, CalendarCheck, BadgeDollarSign } from '@/shared/icons'
import { formatMoneyShort, formatSom } from '@/shared/utils/format-money'
import type { TeacherDashboardResponse } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ data: TeacherDashboardResponse }>()

/** The headline numbers — a tile each, the detail lives in the cards below. */
const tiles = computed(() => {
  const s = props.data.totals
  const collected = s.amountDue ? Math.round((s.amountPaid / s.amountDue) * 100) : 0
  const list = [
    {
      label: t('teacherDashboard.tiles.students'), value: String(s.studentsCount),
      hint: t('teacherDashboard.tiles.groups', { count: s.groupsCount }), icon: GraduationCap, tone: 'primary' as const,
    },
    {
      label: t('teacherDashboard.tiles.collected'), value: formatMoneyShort(s.amountPaid),
      hint: t('teacherDashboard.tiles.ofDue', { due: formatSom(s.amountDue), pct: collected }), icon: HandCoins, tone: 'success' as const,
    },
    {
      label: t('teacherDashboard.tiles.monthDebt'), value: formatMoneyShort(s.debt),
      hint: s.pendingAmount ? t('teacherDashboard.tiles.pending', { amount: formatSom(s.pendingAmount) }) : undefined,
      icon: ReceiptText, tone: 'danger' as const,
    },
    {
      label: t('teacherDashboard.tiles.totalDebt'), value: formatMoneyShort(s.totalDebt),
      hint: t('teacherDashboard.tiles.debtors', { count: props.data.debtors.length }), icon: Wallet, tone: 'warning' as const,
    },
    {
      label: t('teacherDashboard.tiles.attendance'),
      value: s.attendance.rate == null ? '—' : `${s.attendance.rate}%`,
      hint: t('teacherDashboard.tiles.absent', { count: s.attendance.absent }), icon: CalendarCheck, tone: 'info' as const,
    },
  ]
  // Pay is computed when students pay; before that there is nothing to show.
  if (props.data.earning) {
    list.push({
      label: t('teacherDashboard.tiles.earning'), value: formatMoneyShort(props.data.earning.total),
      hint: t('teacherDashboard.tiles.commission', { amount: formatSom(props.data.earning.commission) }),
      icon: BadgeDollarSign, tone: 'primary' as const,
    })
  }
  return list
})
</script>
