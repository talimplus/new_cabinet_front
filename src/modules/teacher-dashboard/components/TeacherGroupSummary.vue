<template>
  <!-- The group's month in five plain numbers, each with a one-line meaning. -->
  <dl class="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
    <div v-for="m in items" :key="m.key" class="min-w-0 rounded-md bg-surface-muted px-3 py-2">
      <dt class="truncate text-xs text-muted-foreground">{{ m.label }}</dt>
      <dd :class="['truncate font-mono text-sm font-semibold', m.tone]">{{ m.value }}</dd>
      <dd class="text-[11px] leading-tight text-muted-foreground">{{ m.hint }}</dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import type { TeacherDashboardGroup } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ group: TeacherDashboardGroup }>()

const items = computed(() => {
  const g = props.group
  const pct = g.amountDue ? Math.round((g.amountPaid / g.amountDue) * 100) : 0
  const older = Math.max(0, g.totalDebt - g.debt)
  return [
    {
      key: 'paid', label: t('teacherDashboard.group.paid'), value: formatSom(g.amountPaid), tone: 'text-success',
      hint: t('teacherDashboard.group.paidHint', { due: formatSom(g.amountDue), pct }),
    },
    {
      key: 'left', label: t('teacherDashboard.group.left'), value: formatSom(Math.max(0, g.debt - g.pendingAmount)),
      tone: 'text-danger', hint: t('teacherDashboard.group.leftHint'),
    },
    {
      key: 'pending', label: t('teacherDashboard.group.pending'), value: formatSom(g.pendingAmount), tone: 'text-info',
      hint: t('teacherDashboard.group.pendingHint'),
    },
    {
      key: 'older', label: t('teacherDashboard.group.older'), value: formatSom(older),
      tone: older > 0 ? 'text-warning' : 'text-foreground', hint: t('teacherDashboard.group.olderHint'),
    },
    {
      key: 'attendance', label: t('teacherDashboard.group.attendance'),
      value: g.attendance.rate == null ? '—' : `${g.attendance.rate}%`, tone: 'text-foreground',
      hint: t('teacherDashboard.group.attendanceHint', { count: g.attendance.absent }),
    },
  ]
})
</script>
