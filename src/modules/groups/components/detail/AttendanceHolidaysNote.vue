<template>
  <div v-if="holidays.length" class="flex flex-wrap items-center gap-2 rounded-md bg-info-soft px-3 py-2 text-xs text-info">
    <UiIcon :icon="CalendarOff" :size="14" />
    <span class="font-semibold">{{ t('holidays.journalNote') }}:</span>
    <span v-for="h in holidays" :key="`${h.fromDate}-${h.name}`">
      {{ h.name }} (<span class="font-mono">{{ range(h) }}</span>)
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { CalendarOff } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import type { LessonDatesHoliday } from '../../interfaces/attendance.interface'

const { t } = useI18n()
defineProps<{ holidays: LessonDatesHoliday[] }>()

const range = (h: LessonDatesHoliday): string =>
  h.fromDate === h.toDate ? formatDate(h.fromDate) : `${formatDate(h.fromDate)} – ${formatDate(h.toDate)}`
</script>
