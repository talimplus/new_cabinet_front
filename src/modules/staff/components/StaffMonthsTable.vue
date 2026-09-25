<template>
  <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" row-key="month" :empty-text="t('staff.empty.months')">
    <template #cell-month="{ row }">
      <span class="font-mono">{{ formatMonth((row as StaffOverviewMonth).month) }}</span>
    </template>
    <template #cell-missedDays="{ row }">
      <span :class="(row as StaffOverviewMonth).missedDays > 0 ? 'text-danger' : 'text-muted-foreground'">
        {{ (row as StaffOverviewMonth).missedDays }}
      </span>
    </template>
    <template #cell-totalLateMinutes="{ row }">
      <span v-if="(row as StaffOverviewMonth).totalLateMinutes > 0" class="font-mono text-warning">
        {{ (row as StaffOverviewMonth).totalLateMinutes }} {{ t('staffAttendance.minutesShort') }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { formatMonth } from '@/shared/utils/format-month'
import type { StaffOverviewMonth } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: StaffOverviewMonth[] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'month', label: t('staff.table.month'), primary: true },
  { key: 'expectedDays', label: t('staffAttendance.report.expectedDays'), align: 'right' },
  { key: 'attendedDays', label: t('staffAttendance.report.attendedDays'), align: 'right' },
  { key: 'missedDays', label: t('staffAttendance.report.missedDays'), align: 'right' },
  { key: 'lateDays', label: t('staffAttendance.report.lateDays'), align: 'right' },
  { key: 'totalLateMinutes', label: t('staff.table.late'), align: 'right' },
])
</script>
