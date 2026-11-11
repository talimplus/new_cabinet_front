<template>
  <section class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div>
      <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.trend.title') }}</h3>
      <!-- Both measures are shares of 100%, so they share one scale. -->
      <ul class="mt-1 flex flex-wrap gap-x-4 text-xs text-muted-foreground">
        <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-success" />{{ t('teacherDashboard.trend.collected') }}</li>
        <li class="flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm bg-info" />{{ t('teacherDashboard.trend.attendance') }}</li>
      </ul>
    </div>
    <ul class="space-y-2.5">
      <li v-for="row in rows" :key="row.month" class="grid grid-cols-[3rem_1fr] items-center gap-3">
        <span class="font-mono text-xs text-muted-foreground">{{ row.label }}</span>
        <div class="space-y-1">
          <div v-for="bar in row.bars" :key="bar.key" class="flex items-center gap-2" :title="bar.title">
            <div class="h-2 flex-1 overflow-hidden rounded-full bg-surface-muted">
              <div :class="['h-full rounded-full', bar.fill]" :style="{ width: `${bar.value ?? 0}%` }" />
            </div>
            <span class="w-11 text-right font-mono text-xs text-foreground">{{ bar.value == null ? '—' : `${bar.value}%` }}</span>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import type { TeacherDashboardTrendPoint } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ trend: TeacherDashboardTrendPoint[] }>()

/** Six months, oldest on top: collected share of the month's charge, and attendance. */
const rows = computed(() =>
  props.trend.map((p) => {
    const collected = p.amountDue ? Math.min(100, Math.round((p.amountPaid / p.amountDue) * 100)) : null
    return {
      month: p.month,
      label: `${t(`common.monthsShort.${p.month.slice(5, 7)}`)} ${p.month.slice(2, 4)}`,
      bars: [
        {
          key: 'collected', fill: 'bg-success', value: collected,
          title: `${t('teacherDashboard.trend.collected')}: ${formatSom(p.amountPaid)} / ${formatSom(p.amountDue)}`,
        },
        {
          key: 'attendance', fill: 'bg-info', value: p.attendanceRate,
          title: `${t('teacherDashboard.trend.attendance')}: ${p.attendanceRate == null ? '—' : `${p.attendanceRate}%`}`,
        },
      ],
    }
  }),
)
</script>
