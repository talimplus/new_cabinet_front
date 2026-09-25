<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIconButton, UiBadge, UiSpinner, UiIcon } from '@/shared/components'
import { RefreshCw, Eye, Sun } from '@/shared/icons'
import { parseDate } from '@/shared/utils/format-date'
import CheckInCard from '@/shared/components/attendance/CheckInCard.vue'
import TodayLessonCard from '../components/TodayLessonCard.vue'
import { useTeacherToday } from '../composables/use-teacher-today'

const { t } = useI18n()
const { data, loading, isCenterScope, lessons, load } = useTeacherToday()
onMounted(load)

// Built from the i18n month/weekday tables — the browser's `uz-UZ` locale is poor.
const WEEKDAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const dateLabel = computed(() => {
  const d = data.value && parseDate(data.value.date)
  if (!d) return ''
  const weekday = t(`common.weekDays.${WEEKDAY_KEYS[d.getDay()]}`)
  const month = t(`common.months.${String(d.getMonth() + 1).padStart(2, '0')}`)
  return `${weekday}, ${d.getDate()} ${month} ${d.getFullYear()}`
})
const canCheckIn = computed(() => !isCenterScope.value && !!data.value?.canCheckIn)
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-3">
      <div class="min-w-0">
        <h1 class="text-lg font-bold text-foreground">{{ t('syllabuses.today.title') }}</h1>
        <p class="text-sm text-muted-foreground">{{ dateLabel }}</p>
      </div>
      <UiBadge v-if="isCenterScope" variant="info" class="ml-1">
        <UiIcon :icon="Eye" :size="14" /> {{ t('syllabuses.today.viewOnly') }}
      </UiBadge>
      <UiIconButton :icon="RefreshCw" :label="t('common.refresh')" class="ml-auto" @click="load" />
    </div>

    <CheckInCard v-if="canCheckIn" />
    <p v-else-if="isCenterScope" class="rounded-md bg-info-soft px-3 py-2 text-sm text-info">
      {{ t('syllabuses.today.centerNotice') }}
    </p>

    <div v-if="loading && !data" class="p-8 text-center">
      <UiSpinner :size="24" class="mx-auto text-muted-foreground" />
    </div>
    <div v-else-if="!lessons.length" class="rounded-lg border border-border bg-surface p-8 text-center">
      <UiIcon :icon="Sun" :size="32" class="mx-auto mb-2 text-warning" />
      <p class="font-medium text-foreground">
        {{ isCenterScope ? t('syllabuses.today.noLessonsCenter') : t('syllabuses.today.noLessons') }}
      </p>
      <p class="text-sm text-muted-foreground">
        {{ isCenterScope ? t('syllabuses.today.noLessonsCenterHint') : t('syllabuses.today.noLessonsHint') }}
      </p>
    </div>
    <div v-else class="space-y-3">
      <TodayLessonCard
        v-for="(lesson, i) in lessons"
        :key="`${lesson.group.id}-${i}`"
        :lesson="lesson"
        :show-teacher="isCenterScope"
      />
    </div>
  </div>
</template>
