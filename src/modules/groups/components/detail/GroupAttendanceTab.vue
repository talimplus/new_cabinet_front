<template>
  <div class="space-y-4">
    <AttendancePicker :month="a.month.value" :year="a.year.value" @update:month="a.setMonth" @update:year="a.setYear" @current="a.goToCurrentMonth" />
    <AttendanceHolidaysNote :holidays="a.holidays.value" />

    <div v-if="a.loading.value" class="p-8 text-center"><UiSpinner :size="22" class="mx-auto text-muted-foreground" /></div>
    <p v-else-if="!students.length" class="p-8 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noStudents') }}</p>
    <p v-else-if="!a.lessonDates.value.length" class="p-8 text-center text-sm text-muted-foreground">{{ t('groups.attendance.noLessonDates') }}</p>
    <AttendanceMatrix v-else :a="a" :students="students" />

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
import { UiSpinner } from '@/shared/components'
import AttendancePicker from './AttendancePicker.vue'
import AttendanceHolidaysNote from './AttendanceHolidaysNote.vue'
import AttendanceMatrix from './AttendanceMatrix.vue'
import AttendanceStatusPicker from './AttendanceStatusPicker.vue'
import AttendanceRescheduleDialog from './AttendanceRescheduleDialog.vue'
import { useAttendance } from '../../composables/use-attendance'
import type { Student } from '@/modules/students/interfaces/student.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ groupId: number; students: Student[] }>()
const a = useAttendance(props.groupId, toRef(props, 'students'))

onMounted(() => a.load())
</script>
