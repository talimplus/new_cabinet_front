<template>
  <div class="space-y-4">
    <AttendancePicker :month="a.month.value" :year="a.year.value" @update:month="a.setMonth" @update:year="a.setYear" @current="a.goToCurrentMonth" />
    <AttendanceHolidaysNote :holidays="a.holidays.value" />

    <div v-if="a.loading.value" class="p-8 text-center"><UiSpinner :size="22" class="mx-auto text-muted-foreground" /></div>
    <p v-else-if="!a.lessonDates.value.length" class="p-8 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noLessonDates') }}</p>
    <template v-else>
      <p v-if="!current.length" class="p-4 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noStudents') }}</p>
      <AttendanceMatrix v-else :a="a" :students="current" />
      <!-- Former members (transferred, stopped), folded away. Only their own
           membership days are editable (fixing a mark before they left). -->
      <UiCollapse v-if="former.length" :title="t('groups.attendance.formerTitle', { count: former.length })">
        <AttendanceMatrix :a="a" :students="former" />
      </UiCollapse>
    </template>

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
import { computed, onMounted, toRef } from 'vue'
import { UiSpinner, UiCollapse } from '@/shared/components'
import AttendancePicker from './AttendancePicker.vue'
import AttendanceHolidaysNote from './AttendanceHolidaysNote.vue'
import AttendanceMatrix from './AttendanceMatrix.vue'
import AttendanceStatusPicker from './AttendanceStatusPicker.vue'
import AttendanceRescheduleDialog from './AttendanceRescheduleDialog.vue'
import { useAttendance } from '../../composables/use-attendance'
import type { Student } from '@/modules/students/interfaces/student.interface'
import type { AttendanceRow } from '../../interfaces/attendance.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** `finished` — the group is closed: its students are no longer ACTIVE, so rows come from the journal. */
const props = defineProps<{ groupId: number; students: Student[]; finished?: boolean; endDate?: string | null }>()
const a = useAttendance(props.groupId, toRef(props, 'students'), props.endDate)

/** Still in the group. A closed group's members are "finished", not ACTIVE — take the journal's list. */
const current = computed<AttendanceRow[]>(() =>
  props.finished ? a.membership.value.filter((m) => !m.leftAt) : props.students,
)
/** Left during the shown month (transferred, stopped) — the journal keeps their marks. */
const former = computed<AttendanceRow[]>(() => a.membership.value.filter((m) => !!m.leftAt))

onMounted(() => a.load())
</script>
