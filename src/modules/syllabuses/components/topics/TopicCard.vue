<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiIcon } from '@/shared/components'
import { GripVertical, BookOpen, FileText, ClipboardList, Pencil, Eye } from '@/shared/icons'
import {
  TOPIC_DIFFICULTY_LABEL_KEYS,
  TOPIC_DIFFICULTY_VARIANTS,
} from '../../enums/topic-difficulty.enum'
import {
  TopicContentKey,
  TOPIC_CONTENT_KEYS,
  TOPIC_CONTENT_LABEL_KEYS,
} from '../../enums/topic-content-key.enum'
import type { SyllabusTopic } from '../../interfaces/syllabus-topic.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  topic: SyllabusTopic
  order: number
  editable?: boolean
  dragging?: boolean
  dragOver?: boolean
}>()
const emit = defineEmits<{ open: [] }>()

const ICONS = {
  [TopicContentKey.GUIDE]: BookOpen,
  [TopicContentKey.LESSON_OUTLINE]: FileText,
  [TopicContentKey.HOMEWORK]: ClipboardList,
}

/** Green icon = the content field is filled, faded = still empty. */
const indicators = computed(() =>
  TOPIC_CONTENT_KEYS.map((key) => {
    const filled = !!props.topic[key]?.trim()
    const state = t(filled ? 'syllabuses.content.filled' : 'syllabuses.content.notFilled')
    return { key, icon: ICONS[key], filled, label: `${t(TOPIC_CONTENT_LABEL_KEYS[key])}: ${state}` }
  }),
)
</script>

<template>
  <li
    class="flex cursor-pointer items-center gap-3 rounded-md border border-border bg-surface p-3 transition-shadow hover:shadow-card"
    :class="[dragging && 'opacity-40', dragOver && 'ring-2 ring-primary']"
    @click="emit('open')"
  >
    <UiIcon
      v-if="editable"
      :icon="GripVertical"
      :size="16"
      class="shrink-0 cursor-grab text-muted-foreground"
      @click.stop
    />
    <span
      class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary-soft font-mono text-xs font-semibold text-primary"
    >
      {{ order }}
    </span>
    <div class="min-w-0 flex-1">
      <p class="truncate font-medium text-foreground">{{ topic.title }}</p>
      <p v-if="topic.description" class="truncate text-xs text-muted-foreground">
        {{ topic.description }}
      </p>
      <div class="mt-1.5 flex flex-wrap items-center gap-2">
        <UiBadge v-if="topic.difficulty" :variant="TOPIC_DIFFICULTY_VARIANTS[topic.difficulty]">
          {{ t(TOPIC_DIFFICULTY_LABEL_KEYS[topic.difficulty]) }}
        </UiBadge>
        <UiBadge v-if="topic.estimatedLessons" variant="neutral">
          {{ t('syllabuses.editor.estimatedLessons', { n: topic.estimatedLessons }) }}
        </UiBadge>
        <span class="flex items-center gap-1">
          <span v-for="ind in indicators" :key="ind.key" :title="ind.label" :aria-label="ind.label" role="img">
            <UiIcon :icon="ind.icon" :size="15" :class="ind.filled ? 'text-success' : 'text-fg-subtle'" />
          </span>
        </span>
      </div>
    </div>
    <UiIcon :icon="editable ? Pencil : Eye" :size="16" class="shrink-0 text-muted-foreground" />
  </li>
</template>
