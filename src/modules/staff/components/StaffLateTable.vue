<template>
  <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.late')">
    <template #cell-workDate="{ row }">
      <span class="font-mono">{{ formatDate((row as StaffLateRecord).workDate) }}</span>
    </template>
    <template #cell-checkInAt="{ row }">
      <span class="font-mono">{{ formatDateTime((row as StaffLateRecord).checkInAt) }}</span>
    </template>
    <template #cell-firstLessonAt="{ row }">
      <span class="font-mono">{{ (row as StaffLateRecord).firstLessonAt?.slice(0, 5) ?? '—' }}</span>
    </template>
    <template #cell-lateMinutes="{ row }">
      <span class="font-mono font-medium text-warning">
        +{{ (row as StaffLateRecord).lateMinutes }} {{ t('staffAttendance.minutesShort') }}
      </span>
    </template>
    <template #cell-confidence="{ row }">
      <UiBadge>{{ t(`staffAttendance.confidence.${(row as StaffLateRecord).confidence}`) }}</UiBadge>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import { formatDate, formatDateTime } from '@/shared/utils/format-date'
import type { StaffLateRecord } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: StaffLateRecord[] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'workDate', label: t('staff.table.date'), primary: true },
  { key: 'checkInAt', label: t('staff.table.arrived') },
  { key: 'firstLessonAt', label: t('staff.table.lessonAt') },
  { key: 'lateMinutes', label: t('staff.table.late'), align: 'right' },
  { key: 'confidence', label: t('staffAttendance.table.confidence') },
])
</script>
