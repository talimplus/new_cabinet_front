<template>
  <div class="space-y-4">
    <AttendancePicker
      :month="a.month.value"
      :year="a.year.value"
      @update:month="a.setMonth"
      @update:year="a.setYear"
      @current="a.goToCurrentMonth"
    />

    <div v-if="a.loading.value" class="p-8 text-center"><UiSpinner :size="22" class="mx-auto text-muted-foreground" /></div>
    <p v-else-if="!students.length" class="p-8 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noStudents') }}</p>
    <p v-else-if="!a.lessonDates.value.length" class="p-8 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noLessonDates') }}</p>

    <div v-else class="overflow-x-auto rounded-lg border border-border bg-surface shadow-card">
      <table class="w-full border-collapse text-sm">
        <thead class="bg-surface-muted">
          <tr>
            <th class="sticky left-0 z-10 min-w-44 bg-surface-muted px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{{ t('groups.attendance.student') }}</th>
            <th v-for="date in a.lessonDates.value" :key="date" class="min-w-24 px-2 py-2 text-center" :class="{ 'bg-primary-soft/50': a.isToday(date) }">
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
            <td class="sticky left-0 z-10 min-w-44 bg-surface px-3 py-2 text-left font-medium">{{ s.firstName }} {{ s.lastName }}</td>
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

    <AttendanceStatusPicker
      v-model="a.picker.open"
      v-model:status="a.picker.status"
      v-model:comment="a.picker.comment"
      :saving="a.picker.saving"
      @save="a.saveCell"
    />
    <AttendanceRescheduleDialog
      v-model="a.reschedule.open"
      :from-date="a.reschedule.fromDate"
      v-model:to-date="a.reschedule.toDate"
      v-model:reason="a.reschedule.reason"
      :saving="a.reschedule.saving"
      @submit="a.submitReschedule"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, toRef } from 'vue'
import { UiSpinner, UiIcon } from '@/shared/components'
import { RefreshCw } from '@/shared/icons'
import AttendancePicker from './AttendancePicker.vue'
import AttendanceCell from './AttendanceCell.vue'
import AttendanceStatusPicker from './AttendanceStatusPicker.vue'
import AttendanceRescheduleDialog from './AttendanceRescheduleDialog.vue'
import { useAttendance } from '../../composables/use-attendance'
import type { Student } from '@/modules/students/interfaces/student.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ groupId: number; students: Student[] }>()
const a = useAttendance(props.groupId, toRef(props, 'students'))

const header = (date: string): string => {
  const d = new Date(date)
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
onMounted(a.load)
</script>
