<template>
  <div class="space-y-3">
    <div v-if="topics.length" class="space-y-2">
      <h4 class="text-sm font-semibold text-foreground">{{ t('syllabuses.today.todayTopics') }}</h4>
      <UiCollapse v-for="topic in topics" :key="topic.id">
        <template #title>{{ topic.title }}</template>
        <template #meta>
          <UiBadge v-if="topic.difficulty" :variant="badge[topic.difficulty]">
            {{ t(diffKeys[topic.difficulty]) }}
          </UiBadge>
        </template>
        <div class="space-y-3">
          <p v-if="topic.description" class="text-sm text-muted-foreground">{{ topic.description }}</p>
          <div v-for="key in SECTIONS" :key="key">
            <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {{ t(`syllabuses.content.${key}`) }}
            </p>
            <UiMarkdown v-if="topic[key]?.trim()" :source="topic[key]" />
            <p v-else class="text-xs text-fg-subtle">{{ t('syllabuses.content.notFilled') }}</p>
          </div>
        </div>
      </UiCollapse>
    </div>

    <UiCollapse v-if="previousTopics.length">
      <template #title>{{ t('syllabuses.today.previousTopics') }} ({{ previousTopics.length }})</template>
      <div class="flex flex-wrap gap-2">
        <UiBadge v-for="p in previousTopics" :key="p.id" variant="neutral">{{ p.title }}</UiBadge>
      </div>
    </UiCollapse>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiCollapse, UiBadge, UiMarkdown } from '@/shared/components'
import {
  TOPIC_DIFFICULTY_BADGE,
  TOPIC_DIFFICULTY_LABEL_KEYS,
} from '@/modules/groups/enums/topic-difficulty.enum'
import type { SyllabusTopic } from '@/modules/syllabuses/interfaces/syllabus-topic.interface'

const { t } = useI18n()
defineProps<{ topics: SyllabusTopic[]; previousTopics: SyllabusTopic[] }>()

const badge = TOPIC_DIFFICULTY_BADGE
const diffKeys = TOPIC_DIFFICULTY_LABEL_KEYS
const SECTIONS = ['guide', 'lessonOutline', 'homework'] as const
</script>
