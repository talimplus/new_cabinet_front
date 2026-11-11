<template>
  <section class="min-w-0 space-y-5 rounded-lg border border-border bg-surface p-4 shadow-card">
    <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.trend.title') }}</h3>
    <!-- Money and attendance have different units, so they are two charts — never one with two axes. -->
    <div class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground">{{ t('teacherDashboard.trend.money') }}</p>
      <UiColumnChart :categories="money" :series="moneySeries" :format="formatSom" />
    </div>
    <div class="space-y-2">
      <p class="text-xs font-medium text-muted-foreground">{{ t('teacherDashboard.trend.attendanceRate') }}</p>
      <UiColumnChart :categories="attendance" :series="attendanceSeries" :format="percent" :axis-format="percent" :max="100" />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiColumnChart } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { ColumnCategory, ColumnSeries } from '@/shared/interfaces/column-chart.interface'
import type { TeacherDashboardTrendPoint } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ trend: TeacherDashboardTrendPoint[] }>()

const percent = (v: number): string => `${v}%`
const monthLabel = (m: string): string => `${t(`common.monthsShort.${m.slice(5, 7)}`)} ${m.slice(2, 4)}`
const monthTitle = (m: string): string => `${t(`common.monthsShort.${m.slice(5, 7)}`)} ${m.slice(0, 4)}`

/** Charged is the reference (neutral), collected the figure that matters (accent). */
const moneySeries = computed<ColumnSeries[]>(() => [
  { key: 'due', label: t('teacherDashboard.trend.due'), fill: 'bg-fg-subtle' },
  { key: 'paid', label: t('teacherDashboard.trend.paid'), fill: 'bg-primary' },
])
const attendanceSeries = computed<ColumnSeries[]>(() => [
  { key: 'rate', label: t('teacherDashboard.trend.attendance'), fill: 'bg-primary' },
])

/** Six months, oldest first. */
const money = computed<ColumnCategory[]>(() =>
  props.trend.map((p) => ({
    key: p.month,
    label: monthLabel(p.month),
    title: monthTitle(p.month),
    values: [p.amountDue, p.amountPaid],
    note: p.amountDue
      ? t('teacherDashboard.trend.collectedShare', { pct: Math.round((p.amountPaid / p.amountDue) * 100) })
      : undefined,
  })),
)
const attendance = computed<ColumnCategory[]>(() =>
  props.trend.map((p) => ({
    key: p.month,
    label: monthLabel(p.month),
    title: monthTitle(p.month),
    values: [p.attendanceRate],
  })),
)
</script>
