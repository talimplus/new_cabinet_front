<template>
  <section class="space-y-3">
    <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.groups.title') }}</h3>
    <UiTable
      :columns="columns"
      :rows="groups as unknown as Record<string, unknown>[]"
      :empty-text="t('teacherDashboard.groups.empty')"
      :row-click="canOpen ? (row) => emit('open', row as unknown as TeacherDashboardGroup) : undefined"
    >
      <template #cell-studentsCount="{ row }"><span class="font-mono">{{ (row as TeacherDashboardGroup).studentsCount }}</span></template>
      <template #cell-payments="{ row }">
        <div class="min-w-40">
          <UiStackedBar :segments="segments(row as TeacherDashboardGroup)" :legend="false" :title="(row as TeacherDashboardGroup).name" />
          <p class="mt-1 font-mono text-xs text-muted-foreground">
            <span class="text-success">{{ (row as TeacherDashboardGroup).paidCount }}</span> /
            <span class="text-warning">{{ (row as TeacherDashboardGroup).partialCount }}</span> /
            <span class="text-danger">{{ (row as TeacherDashboardGroup).unpaidCount }}</span>
          </p>
        </div>
      </template>
      <template #cell-collected="{ row }">
        <span class="whitespace-nowrap font-mono">{{ formatSom((row as TeacherDashboardGroup).amountPaid) }}</span>
      </template>
      <template #cell-debt="{ row }">
        <span class="whitespace-nowrap font-mono text-danger">{{ formatSom((row as TeacherDashboardGroup).debt) }}</span>
      </template>
      <template #cell-attendance="{ row }">
        <span class="font-mono">{{ rate(row as TeacherDashboardGroup) }}</span>
      </template>
    </UiTable>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiStackedBar } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { TeacherDashboardGroup } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
defineProps<{ groups: TeacherDashboardGroup[]; canOpen?: boolean }>()
const emit = defineEmits<{ open: [group: TeacherDashboardGroup] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('teacherDashboard.groups.name'), primary: true },
  { key: 'studentsCount', label: t('teacherDashboard.groups.students'), align: 'right' },
  { key: 'payments', label: t('teacherDashboard.groups.payments') },
  { key: 'collected', label: t('teacherDashboard.groups.collected'), align: 'right' },
  { key: 'debt', label: t('teacherDashboard.groups.debt'), align: 'right' },
  { key: 'attendance', label: t('teacherDashboard.groups.attendance'), align: 'right' },
])

const segments = (g: TeacherDashboardGroup): StackedSegment[] => [
  { key: 'paid', label: t('teacherDashboard.payments.paid'), value: g.paidCount, tone: 'success' },
  { key: 'partial', label: t('teacherDashboard.payments.partial'), value: g.partialCount, tone: 'warning' },
  { key: 'unpaid', label: t('teacherDashboard.payments.unpaid'), value: g.unpaidCount, tone: 'danger' },
]
const rate = (g: TeacherDashboardGroup): string => (g.attendance.rate == null ? '—' : `${g.attendance.rate}%`)
</script>
