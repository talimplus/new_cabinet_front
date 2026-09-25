<template>
  <div class="space-y-3">
    <UiTable :columns="columns" :rows="rows" :loading="loading" :empty-text="t('common.noData')">
      <template #cell-staff="{ row }">{{ (row as Row).staff }}</template>
      <template #cell-missedDays="{ row }">
        <span :class="Number((row as Row).missedDays) > 0 ? 'text-danger' : 'text-muted-foreground'">
          {{ (row as Row).missedDays }}
        </span>
      </template>
      <template #cell-totalLate="{ row }">
        <span v-if="Number((row as Row).totalLateRaw) > 0" class="text-warning">
          {{ formatDuration(Number((row as Row).totalLateRaw)) }}
        </span>
        <span v-else class="text-muted-foreground">—</span>
      </template>
      <template #cell-flaggedDays="{ row }">
        <UiBadge v-if="Number((row as Row).flaggedDays) > 0" variant="warning">{{ (row as Row).flaggedDays }}</UiBadge>
        <span v-else class="text-muted-foreground">—</span>
      </template>
    </UiTable>
    <p class="text-xs text-muted-foreground">{{ t('staffAttendance.report.hint') }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import type { StaffAttendanceReport } from '../interfaces/staff-attendance-report.interface'

type Row = Record<string, unknown>
const { t } = useI18n()
const props = defineProps<{ report: StaffAttendanceReport | null; loading?: boolean }>()

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} ${t('staffAttendance.minutesShort')}`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  const h = `${hours} ${t('staffAttendance.hoursShort')}`
  return rest ? `${h} ${rest} ${t('staffAttendance.minutesShort')}` : h
}

const rows = computed<Row[]>(() =>
  (props.report?.rows ?? []).map((r) => ({
    staff: `${r.user.firstName} ${r.user.lastName}`.trim(),
    expectedDays: r.expectedDays,
    attendedDays: r.attendedDays,
    missedDays: r.missedDays,
    lateDays: r.lateDays,
    totalLateRaw: r.totalLateMinutes,
    flaggedDays: r.flaggedDays,
  })),
)
const columns = computed(() => [
  { key: 'staff', label: t('staffAttendance.table.staff'), primary: true },
  { key: 'expectedDays', label: t('staffAttendance.report.expectedDays') },
  { key: 'attendedDays', label: t('staffAttendance.report.attendedDays') },
  { key: 'missedDays', label: t('staffAttendance.report.missedDays') },
  { key: 'lateDays', label: t('staffAttendance.report.lateDays') },
  { key: 'totalLate', label: t('staffAttendance.report.totalLate') },
  { key: 'flaggedDays', label: t('staffAttendance.report.flagged') },
])
</script>
