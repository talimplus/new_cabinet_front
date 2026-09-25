<template>
  <UiTable :columns="columns" :rows="rows as unknown as Row[]" :loading="loading" :empty-text="t('common.noData')">
    <template #cell-staff="{ row }">{{ fullName(row as StaffAttendance) }}</template>
    <template #cell-date="{ row }"><span class="font-mono text-xs">{{ formatDate((row as StaffAttendance).workDate) }}</span></template>
    <template #cell-arrived="{ row }">
      <div class="font-mono text-xs">{{ time((row as StaffAttendance).checkInAt) }}</div>
      <div v-if="(row as StaffAttendance).firstLessonAt" class="text-[11px] text-muted-foreground">
        {{ t('staffAttendance.table.lessonAt', { time: (row as StaffAttendance).firstLessonAt!.slice(0, 5) }) }}
      </div>
    </template>
    <template #cell-late="{ row }">
      <span v-if="(row as StaffAttendance).lateMinutes > 0" class="font-mono text-xs text-warning">
        +{{ (row as StaffAttendance).lateMinutes }} {{ t('staffAttendance.minutesShort') }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>
    <template #cell-confidence="{ row }">
      <UiBadge :variant="confBadge[(row as StaffAttendance).confidence]">{{ t(confKeys[(row as StaffAttendance).confidence]) }}</UiBadge>
      <p v-if="visibleFlags(row as StaffAttendance).length" class="mt-1 text-[11px] text-muted-foreground">
        {{ visibleFlags(row as StaffAttendance).map((f) => t(flagKeys[f])).join(' · ') }}
      </p>
    </template>
    <template #cell-source="{ row }">
      <span class="text-xs text-muted-foreground">{{ t(sourceKeys[(row as StaffAttendance).source]) }}</span>
      <UiIcon v-if="(row as StaffAttendance).confirmedAt" :icon="ShieldCheck" :size="14" class="ml-1 inline text-success" />
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiIconButton
          v-if="canManage && !(row as StaffAttendance).confirmedAt"
          :icon="CheckCheck" tone="primary" :label="t('staffAttendance.confirmAction')"
          @click="emit('confirm', row as StaffAttendance)"
        />
        <UiIconButton v-if="canManage" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="emit('delete', row as StaffAttendance)" />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIcon, UiIconButton } from '@/shared/components'
import { ShieldCheck, CheckCheck, Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import { ATTENDANCE_CONFIDENCE_BADGE, ATTENDANCE_CONFIDENCE_LABEL_KEYS, ATTENDANCE_SOURCE_LABEL_KEYS } from '@/shared/enums/attendance-confidence.enum'
import { AttendanceFlag, ATTENDANCE_FLAG_LABEL_KEYS } from '@/shared/enums/attendance-flag.enum'
import type { StaffAttendance } from '@/shared/interfaces/staff-attendance.interface'

type Row = Record<string, unknown>
const { t } = useI18n()
defineProps<{ rows: StaffAttendance[]; loading?: boolean; canManage?: boolean }>()
const emit = defineEmits<{ confirm: [StaffAttendance]; delete: [StaffAttendance] }>()

const confBadge = ATTENDANCE_CONFIDENCE_BADGE
const confKeys = ATTENDANCE_CONFIDENCE_LABEL_KEYS
const sourceKeys = ATTENDANCE_SOURCE_LABEL_KEYS
const flagKeys = ATTENDANCE_FLAG_LABEL_KEYS

const fullName = (r: StaffAttendance): string =>
  r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : '—'
const time = (iso: string): string =>
  new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
const visibleFlags = (r: StaffAttendance): AttendanceFlag[] =>
  (r.flags ?? []).filter((f) => f !== AttendanceFlag.NO_LESSON_TODAY)

const columns = computed(() => [
  { key: 'staff', label: t('staffAttendance.table.staff'), primary: true },
  { key: 'date', label: t('staffAttendance.table.date') },
  { key: 'arrived', label: t('staffAttendance.table.arrived') },
  { key: 'late', label: t('staffAttendance.table.late') },
  { key: 'confidence', label: t('staffAttendance.table.confidence') },
  { key: 'source', label: t('staffAttendance.table.source') },
])
</script>
