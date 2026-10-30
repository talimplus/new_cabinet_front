<template>
  <section class="rounded-lg border border-border bg-surface shadow-card">
    <header class="border-b border-border p-4">
      <h3 class="flex items-center gap-2 text-base font-semibold text-foreground">
        <UiIcon :icon="CalendarCheck" :size="18" class="text-primary" />
        {{ t('students.attendanceHistory.heading') }}
      </h3>
      <p class="mt-0.5 text-sm text-muted-foreground">{{ t('students.attendanceHistory.subtitle') }}</p>
    </header>
    <div class="space-y-4 p-4">
      <UiSpinner v-if="att.loading.value" class="mx-auto" />
      <p v-else-if="att.failed.value" class="text-sm text-danger">{{ t('students.attendanceHistory.loadError') }}</p>
      <p v-else-if="!att.groups.value.length" class="text-sm text-muted-foreground">{{ t('students.attendanceHistory.empty') }}</p>
      <template v-else>
        <div class="grid gap-2 md:grid-cols-2">
          <StudentAttendanceGroupCard
            v-for="g in att.groups.value"
            :key="g.groupId"
            :group="g"
            :active="att.groupId.value === g.groupId"
            @select="att.selectGroup(g.groupId)"
          />
        </div>
        <StudentAttendanceList :items="att.visible.value" :remaining="att.remaining.value" @show-more="att.showMore" />
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon, UiSpinner } from '@/shared/components'
import { CalendarCheck } from '@/shared/icons'
import StudentAttendanceGroupCard from './StudentAttendanceGroupCard.vue'
import StudentAttendanceList from './StudentAttendanceList.vue'
import { useStudentAttendance } from '../../composables/use-student-attendance'

const { t } = useI18n()

const props = defineProps<{ studentId: number | null; refreshKey?: unknown }>()

const att = useStudentAttendance(() => props.studentId)
onMounted(att.load)
// A transfer/stop on the card changes the groups — reload with the summary.
watch(() => props.refreshKey, () => att.load())
</script>
