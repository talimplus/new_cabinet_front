<template>
  <div>
    <p v-if="!items.length" class="text-sm text-muted-foreground">{{ t('students.attendanceHistory.noMarks') }}</p>
    <ul v-else class="divide-y divide-border rounded-md border border-border text-sm">
      <li v-for="i in items" :key="i.id" class="flex flex-col gap-1 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div class="min-w-0">
          <span class="font-mono">{{ formatDate(i.lessonDate) }}</span>
          <span class="text-muted-foreground"> · {{ i.groupName }}</span>
          <p v-if="i.comment" class="truncate text-xs text-muted-foreground">{{ i.comment }}</p>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <span v-if="i.submittedBy" class="text-xs text-muted-foreground">{{ i.submittedBy }}</span>
          <UiBadge :variant="ATTENDANCE_STATUS_VARIANTS[i.status]">{{ t(ATTENDANCE_STATUS_LABEL_KEYS[i.status]) }}</UiBadge>
        </div>
      </li>
    </ul>
    <UiButton v-if="remaining > 0" variant="ghost" size="sm" class="mt-2" @click="emit('show-more')">
      {{ t('common.timeline.showMore', { count: remaining }) }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiBadge, UiButton } from '@/shared/components'
import { formatDate } from '@/shared/utils/format-date'
import {
  ATTENDANCE_STATUS_LABEL_KEYS,
  ATTENDANCE_STATUS_VARIANTS,
} from '@/modules/groups/enums/attendance-status.enum'
import type { StudentAttendanceItem } from '../../interfaces/student-attendance.interface'

const { t } = useI18n()

defineProps<{ items: StudentAttendanceItem[]; remaining: number }>()
const emit = defineEmits<{ 'show-more': [] }>()
</script>
