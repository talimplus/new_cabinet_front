<template>
  <div v-if="group" class="grid gap-4 md:grid-cols-2">
    <section class="rounded-lg border border-border bg-surface p-4 shadow-card">
      <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t('groups.info.basicInfo') }}</h3>
      <dl class="space-y-2.5">
        <div v-for="row in infoRows" :key="row.label" class="flex justify-between gap-4 text-sm">
          <dt class="text-muted-foreground">{{ row.label }}</dt>
          <dd class="text-right font-medium" :class="row.mono && 'font-mono'">{{ row.value }}</dd>
        </div>
        <div class="flex justify-between gap-4 text-sm">
          <dt class="text-muted-foreground">{{ t('groups.info.endDate') }}</dt>
          <dd class="text-right">
            <UiBadge v-if="!group.endDate" variant="warning">{{ t('groups.noEndDate') }}</UiBadge>
            <span v-else class="font-mono font-medium">{{ formatDate(group.endDate) }}</span>
          </dd>
        </div>
        <div class="flex justify-between gap-4 text-sm">
          <dt class="text-muted-foreground">{{ t('groups.info.status') }}</dt>
          <dd><UiBadge :variant="statusVariant">{{ statusLabel }}</UiBadge></dd>
        </div>
      </dl>
    </section>

    <section class="rounded-lg border border-border bg-surface p-4 shadow-card">
      <h3 class="mb-3 text-sm font-semibold text-foreground">{{ t('groups.info.schedule') }}</h3>
      <ul v-if="group.schedules?.length" class="space-y-2">
        <li v-for="s in group.schedules" :key="s.id ?? s.day" class="flex items-center gap-2 text-sm">
          <UiBadge variant="neutral">{{ t(dayLabelKeys[s.day]) }}</UiBadge>
          <span class="font-mono">{{ s.startTime }}</span>
        </li>
      </ul>
      <p v-else class="text-sm text-muted-foreground">{{ t('groups.info.noSchedule') }}</p>

      <h3 class="mb-2 mt-5 text-sm font-semibold text-foreground">{{ t('groups.info.summary') }}</h3>
      <div class="space-y-2">
        <div class="flex justify-between gap-4 text-sm">
          <span class="text-muted-foreground">{{ t('groups.info.studentsCount') }}</span>
          <span class="font-mono font-medium">{{ studentCount }}</span>
        </div>
        <div class="flex justify-between gap-4 text-sm">
          <span class="text-muted-foreground">{{ t('groups.info.lessonsPerWeek') }}</span>
          <span class="font-mono font-medium">{{ group.schedules?.length ?? 0 }}</span>
        </div>
        <div class="flex justify-between gap-4 text-sm">
          <span class="text-muted-foreground">{{ t('groups.info.endDate') }}</span>
          <span v-if="group.endDate" class="font-mono font-medium">{{ formatDate(group.endDate) }}</span>
          <UiBadge v-else variant="warning">{{ t('groups.noEndDate') }}</UiBadge>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { WEEK_DAY_LABEL_KEYS } from '../../enums/week-day.enum'
import { GROUP_STATUS_LABEL_KEYS, GroupStatus } from '../../enums/group-status.enum'
import type { Group } from '../../interfaces/group.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ group: Group | null; studentCount: number }>()

// Backend serializes monthlyFee as a string; coerce for the money formatter.
const feeNum = (v: number | string | null | undefined): number | null => (v == null || v === '' ? null : Number(v))
const lessonDuration = computed(() =>
  props.group?.lessonDurationMinutes
    ? `${props.group.lessonDurationMinutes} ${t('groups.form.minutesShort')}`
    : '—',
)

const dayLabelKeys = WEEK_DAY_LABEL_KEYS
const STATUS_VARIANTS: Record<GroupStatus, 'info' | 'success' | 'neutral'> = {
  [GroupStatus.NEW]: 'info',
  [GroupStatus.STARTED]: 'success',
  [GroupStatus.FINISHED]: 'neutral',
}
const teacherName = computed(() => {
  const teacher = props.group?.teacher
  return teacher ? `${teacher.firstName ?? ''} ${teacher.lastName ?? ''}`.trim() || '—' : '—'
})
const statusLabel = computed(() =>
  props.group?.status ? t(GROUP_STATUS_LABEL_KEYS[props.group.status]) : '—',
)
const statusVariant = computed(() =>
  props.group?.status ? STATUS_VARIANTS[props.group.status] : 'neutral',
)
const infoRows = computed(() => [
  { label: t('groups.info.subject'), value: props.group?.subject?.name ?? '—', mono: false },
  { label: t('groups.info.teacher'), value: teacherName.value, mono: false },
  { label: t('groups.info.room'), value: props.group?.room?.name ?? '—', mono: false },
  { label: t('groups.info.monthlyFee'), value: formatSom(feeNum(props.group?.monthlyFee)), mono: true },
  { label: t('groups.info.lessonDuration'), value: lessonDuration.value, mono: true },
  { label: t('groups.info.startDate'), value: formatDate(props.group?.startDate), mono: true },
])
</script>
