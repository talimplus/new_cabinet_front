<template>
  <section class="space-y-4 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="flex items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-semibold text-foreground">{{ t('teacherDashboard.attendance.title') }}</h3>
        <p class="text-xs text-muted-foreground">{{ t('teacherDashboard.attendance.hint') }}</p>
      </div>
      <!-- Hero figure: the share of marks where the student came (late counts as came). -->
      <p class="font-mono text-2xl font-bold text-foreground">
        {{ attendance.rate == null ? '—' : `${attendance.rate}%` }}
      </p>
    </div>
    <UiStackedBar v-if="marked" :segments="segments" />
    <p v-else class="text-sm text-muted-foreground">{{ t('teacherDashboard.attendance.empty') }}</p>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiStackedBar } from '@/shared/components'
import type { StackedSegment } from '@/shared/interfaces/stacked-segment.interface'
import type { TeacherAttendanceStats } from '../interfaces/teacher-dashboard.interface'

const { t } = useI18n()
const props = defineProps<{ attendance: TeacherAttendanceStats }>()

const marked = computed(
  () => props.attendance.present + props.attendance.late + props.attendance.absent + props.attendance.excused > 0,
)
const segments = computed<StackedSegment[]>(() => [
  { key: 'present', label: t('teacherDashboard.attendance.present'), value: props.attendance.present, tone: 'success' },
  { key: 'late', label: t('teacherDashboard.attendance.late'), value: props.attendance.late, tone: 'warning' },
  { key: 'absent', label: t('teacherDashboard.attendance.absent'), value: props.attendance.absent, tone: 'danger' },
  { key: 'excused', label: t('teacherDashboard.attendance.excused'), value: props.attendance.excused, tone: 'info' },
])
</script>
