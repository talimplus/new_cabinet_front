<template>
  <td
    :class="cn(
      'border border-border p-2 text-center align-middle transition-colors',
      today && 'bg-primary-soft/40',
      outside && 'bg-surface-muted/60 opacity-40',
      cancelled && 'opacity-40',
      future && !cancelled && 'opacity-40',
      past && !editable && !outside && 'opacity-70',
      editable ? 'cursor-pointer hover:bg-surface-muted' : 'cursor-default',
    )"
    @click="editable && emit('click')"
  >
    <div class="relative flex items-center justify-center" :title="note || comment || undefined">
      <UiIcon :icon="icon" :size="20" :class="colorClass" />
      <span v-if="comment" class="absolute -right-0.5 -top-0.5 h-1.5 w-1.5 rounded-full bg-brand" />
    </div>
  </td>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import { UiIcon } from '@/shared/components'
import { Ban, CircleAlert, Minus } from '@/shared/icons'
import {
  AttendanceStatus,
  ATTENDANCE_STATUS_ICONS,
  ATTENDANCE_STATUS_COLORS,
} from '../../enums/attendance-status.enum'

interface Props {
  status: AttendanceStatus | null
  editable?: boolean
  today?: boolean
  past?: boolean
  future?: boolean
  cancelled?: boolean
  /** Cell falls outside the student's join/leave window → read-only, shows a dash. */
  outside?: boolean
  /** Hover reason for a locked cell (enrollment note); falls back to the comment. */
  note?: string
  comment?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ click: [] }>()

const icon = computed(() => {
  if (props.cancelled) return Ban
  if (props.status) return ATTENDANCE_STATUS_ICONS[props.status]
  if (props.outside) return Minus
  return CircleAlert
})
const colorClass = computed(() =>
  props.status ? ATTENDANCE_STATUS_COLORS[props.status] : 'text-fg-subtle',
)
</script>
