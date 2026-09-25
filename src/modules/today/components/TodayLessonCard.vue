<template>
  <div class="space-y-3 rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="flex flex-wrap items-center gap-2">
      <span class="flex items-center gap-1 font-mono text-sm text-muted-foreground">
        <UiIcon :icon="Clock" :size="15" />{{ time }}
      </span>
      <h3 class="font-semibold text-foreground">{{ lesson.group.name }}</h3>
      <UiBadge variant="info">{{ t('syllabuses.today.lessonNumber', { n: lesson.lessonNumber }) }}</UiBadge>
    </div>

    <div class="flex flex-wrap gap-2">
      <UiBadge v-if="showTeacher && lesson.teacher" variant="neutral">
        {{ lesson.teacher.firstName }} {{ lesson.teacher.lastName }}
      </UiBadge>
      <UiBadge v-if="lesson.group.subject" variant="neutral">{{ lesson.group.subject.name }}</UiBadge>
      <UiBadge v-if="lesson.group.room" variant="neutral">{{ lesson.group.room.name }}</UiBadge>
    </div>

    <p v-if="!lesson.hasSyllabus" class="rounded-md bg-warning-soft px-3 py-2 text-xs text-warning">
      {{ t('syllabuses.today.noSyllabus') }}
      <RouterLink :to="`/groups/${lesson.group.id}`" class="font-semibold underline">
        {{ t('syllabuses.today.goToPlan') }}
      </RouterLink>
    </p>
    <p v-else-if="!lesson.topics.length" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">
      {{ t('syllabuses.today.noTopicsAssigned') }}
      <RouterLink :to="`/groups/${lesson.group.id}`" class="font-semibold underline">
        {{ t('syllabuses.today.goToPlan') }}
      </RouterLink>
    </p>
    <TodayTopics v-else :topics="lesson.topics" :previous-topics="lesson.previousTopics" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { UiIcon, UiBadge } from '@/shared/components'
import { Clock } from '@/shared/icons'
import TodayTopics from './TodayTopics.vue'
import type { TodayLesson } from '../interfaces/teacher-today.interface'

const { t } = useI18n()
const props = defineProps<{ lesson: TodayLesson; showTeacher?: boolean }>()
const time = computed(() => props.lesson.startTime?.slice(0, 5) ?? '—')
</script>
