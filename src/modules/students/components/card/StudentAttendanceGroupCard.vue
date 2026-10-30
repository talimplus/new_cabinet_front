<template>
  <button
    type="button"
    :class="cn(
      'w-full rounded-md border p-3 text-left transition-colors',
      active ? 'border-primary bg-primary-soft' : 'border-border hover:bg-surface-muted',
    )"
    @click="emit('select')"
  >
    <div class="flex flex-wrap items-center gap-2">
      <span class="min-w-0 truncate font-medium text-foreground">{{ group.groupName }}</span>
      <UiBadge :variant="group.isCurrent ? 'success' : 'neutral'">
        {{ t(group.isCurrent ? 'students.attendanceHistory.current' : 'students.attendanceHistory.former') }}
      </UiBadge>
    </div>
    <p class="mt-1 text-xs text-muted-foreground">
      <span class="font-mono">{{ formatDate(group.joinedAt) }} – {{ group.leftAt ? formatDate(group.leftAt) : t('students.attendanceHistory.now') }}</span>
      <span v-if="group.transferredToGroupName">
        · {{ t('students.attendanceHistory.transferredTo', { name: group.transferredToGroupName }) }}
      </span>
    </p>
    <div class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
      <span v-for="s in statuses" :key="s" :class="ATTENDANCE_STATUS_COLORS[s]">
        {{ t(ATTENDANCE_STATUS_LABEL_KEYS[s]) }}: <span class="font-mono font-semibold">{{ group.counts[s] }}</span>
      </span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { formatDate } from '@/shared/utils/format-date'
import {
  AttendanceStatus,
  ATTENDANCE_STATUS_COLORS,
  ATTENDANCE_STATUS_LABEL_KEYS,
} from '@/modules/groups/enums/attendance-status.enum'
import type { StudentAttendanceGroup } from '../../interfaces/student-attendance.interface'

const { t } = useI18n()

defineProps<{ group: StudentAttendanceGroup; active?: boolean }>()
const emit = defineEmits<{ select: [] }>()

const statuses = Object.values(AttendanceStatus)
</script>
