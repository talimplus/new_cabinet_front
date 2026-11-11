<template>
  <section class="space-y-5 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div>
      <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.payments.title') }}</h3>
      <p class="text-xs text-muted-foreground">{{ t('teacherDashboard.payments.hint') }}</p>
    </div>

    <div class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground">{{ t('teacherDashboard.payments.byStudents') }}</p>
      <UiStackedBar :segments="countSegments" />
    </div>

    <div class="space-y-2">
      <div class="flex items-baseline justify-between gap-2">
        <p class="text-xs font-medium text-muted-foreground">{{ t('teacherDashboard.payments.byMoney') }}</p>
        <p class="font-mono text-sm font-semibold text-foreground">
          {{ formatSom(totals.amountPaid) }} / {{ formatSom(totals.amountDue) }}
        </p>
      </div>
      <UiStackedBar :segments="moneySegments" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStackedBar } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { TeacherDashboardTotals } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ totals: TeacherDashboardTotals }>()

/** How many of the month's rows are fully paid, part paid, not paid at all. */
const countSegments = computed<StackedSegment[]>(() => [
  { key: 'paid', label: t('teacherDashboard.payments.paid'), value: props.totals.paidCount, tone: 'success' },
  { key: 'partial', label: t('teacherDashboard.payments.partial'), value: props.totals.partialCount, tone: 'warning' },
  { key: 'unpaid', label: t('teacherDashboard.payments.unpaid'), value: props.totals.unpaidCount, tone: 'danger' },
])

/**
 * Where the month's money is: collected, handed to reception but not yet
 * confirmed, and still owed. The three add up to what was charged.
 */
const moneySegments = computed<StackedSegment[]>(() => {
  const owed = Math.max(0, props.totals.debt - props.totals.pendingAmount)
  return [
    { key: 'paid', label: t('teacherDashboard.payments.collected'), value: props.totals.amountPaid, tone: 'success', display: formatSom(props.totals.amountPaid) },
    { key: 'pending', label: t('teacherDashboard.payments.pending'), value: props.totals.pendingAmount, tone: 'info', display: formatSom(props.totals.pendingAmount) },
    { key: 'owed', label: t('teacherDashboard.payments.owed'), value: owed, tone: 'danger', display: formatSom(owed) },
  ]
})
</script>
