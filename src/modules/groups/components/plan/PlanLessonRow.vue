<template>
  <div
    :class="
      cn(
        'rounded-lg border border-border bg-surface',
        lesson.isToday && 'border-primary/50 bg-primary-soft/30',
        lesson.isPast && !lesson.isToday && 'opacity-60',
      )
    "
  >
    <button
      type="button"
      class="flex w-full items-center gap-3 p-3 text-left"
      @click="canEdit && (open = !open)"
    >
      <span
        :class="
          cn(
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-xs font-semibold',
            lesson.isToday
              ? 'bg-primary text-primary-foreground'
              : 'bg-surface-muted text-muted-foreground',
          )
        "
      >
        {{ lesson.lessonNumber }}
      </span>
      <span class="w-24 shrink-0 font-mono text-sm">
        <template v-if="lesson.date">{{ formatDate(lesson.date) }}</template>
        <span v-else class="text-muted-foreground">{{ t('groups.plan.noDate') }}</span>
      </span>
      <span class="flex min-w-0 flex-1 flex-wrap gap-1">
        <UiBadge
          v-for="topic in lesson.topics"
          :key="topic.id"
          :variant="topic.difficulty ? DIFFICULTY_BADGE[topic.difficulty] : 'neutral'"
        >
          {{ topic.title }}
        </UiBadge>
        <span v-if="!lesson.topics.length" class="text-xs text-muted-foreground">{{ t('groups.plan.noTopic') }}</span>
      </span>
      <UiIcon
        v-if="canEdit"
        :icon="open ? ChevronUp : ChevronDown"
        :size="16"
        class="shrink-0 text-muted-foreground"
      />
    </button>

    <LessonTopicsEditor
      v-if="canEdit && open"
      :topics="syllabusTopics"
      :selected-ids="selectedIds"
      :saving="saving"
      :dirty="dirty"
      @toggle="(p) => emit('toggle', p)"
      @save="emit('save')"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UiBadge, UiIcon } from '@/shared/components'
import { ChevronDown, ChevronUp } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { formatDate } from '@/shared/utils/format-date'
import { TOPIC_DIFFICULTY_BADGE as DIFFICULTY_BADGE } from '../../enums/topic-difficulty.enum'
import LessonTopicsEditor from './LessonTopicsEditor.vue'
import type { PlanLesson, PlanTopic } from '../../interfaces/group-plan.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  lesson: PlanLesson
  syllabusTopics: PlanTopic[]
  selectedIds: number[]
  saving?: boolean
  dirty?: boolean
  canEdit?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  toggle: [payload: { topicId: number; checked: boolean }]
  save: []
}>()

const open = ref(false)
</script>
