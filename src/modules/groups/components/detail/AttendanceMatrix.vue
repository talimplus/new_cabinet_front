<template>
  <div ref="scroller" class="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
    <table class="w-full border-collapse text-sm">
      <thead class="bg-surface-muted">
        <tr>
          <th ref="nameHead" class="sticky left-0 z-10 min-w-44 bg-surface-muted px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{{ t('groups.attendance.student') }}</th>
          <th v-for="date in a.lessonDates.value" :key="date" class="min-w-24 px-2 py-2 text-center" :class="{ 'bg-primary-soft/50': a.isToday(date) }" :data-today="a.isToday(date) || undefined">
            <div class="flex items-center justify-center gap-1 font-mono text-xs">
              {{ header(date) }}
              <button v-if="a.canRescheduleDate(date)" type="button" class="rounded p-0.5 text-primary hover:bg-surface" @click="a.openReschedule(date)">
                <UiIcon :icon="RefreshCw" :size="14" />
              </button>
            </div>
            <span
              v-if="a.overrideType(date)"
              class="mt-0.5 block text-[10px] font-medium"
              :class="a.overrideType(date) === 'cancelled' ? 'text-muted-foreground line-through' : 'text-brand'"
            >
              {{ t(`groups.override.${a.overrideType(date)}`) }}
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.id" class="border-t border-border">
          <td class="sticky left-0 z-10 min-w-44 bg-surface px-3 py-2 text-left font-medium">{{ s.lastName }} {{ s.firstName }}</td>
          <AttendanceCell
            v-for="date in a.lessonDates.value"
            :key="`${s.id}-${date}`"
            :status="a.statusOf(s.id, date)"
            :editable="a.canEditCell(date) && !a.isOutsideEnrollment(s.id, date)"
            :today="a.isToday(date)"
            :past="a.isPast(date)"
            :future="a.isFuture(date)"
            :cancelled="a.isCancelled(date)"
            :outside="a.isOutsideEnrollment(s.id, date)"
            :note="a.enrollmentReason(s.id, date)"
            :comment="a.commentOf(s.id, date)"
            @click="a.openCell(s.id, date)"
          />
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { RefreshCw } from '@/shared/icons'
import AttendanceCell from './AttendanceCell.vue'
import type { useAttendance } from '../../composables/use-attendance'
import type { Student } from '@/modules/students/interfaces/student.interface'

const { t } = useI18n()

defineProps<{ a: ReturnType<typeof useAttendance>; students: Student[] }>()

const scroller = ref<HTMLElement | null>(null)
const nameHead = ref<HTMLElement | null>(null)

const header = (date: string): string => {
  const d = new Date(date)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Opens on today's column (one lesson of context before it) so a phone does
 * not start at the 1st of the month. Runs once per mount — a saved mark
 * refreshes silently and keeps the matrix (and this scroll) where it is.
 */
onMounted(() => {
  const today = scroller.value?.querySelector<HTMLElement>('th[data-today]')
  if (!scroller.value || !today) return
  const sticky = nameHead.value?.offsetWidth ?? 0
  scroller.value.scrollLeft = Math.max(0, today.offsetLeft - sticky - today.offsetWidth)
})
</script>
