<template>
  <div class="rounded-lg border border-border bg-surface p-3">
    <h3 class="text-sm font-semibold text-foreground">{{ plan.name }}</h3>
    <p v-if="plan.description" class="mt-1 text-xs text-muted-foreground">{{ plan.description }}</p>

    <div class="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
      <span class="font-mono">Darslar: {{ totalLessons }}</span>
      <span class="font-mono">Mavzular: {{ plan.topics.length }}</span>
    </div>

    <ul class="mt-3 space-y-1.5">
      <li
        v-for="(topic, i) in plan.topics"
        :key="i"
        class="flex items-center gap-2 rounded-md bg-surface-muted px-2 py-1.5"
      >
        <span class="w-5 shrink-0 text-center font-mono text-xs text-muted-foreground">{{ i + 1 }}</span>
        <span class="min-w-0 flex-1 truncate text-sm text-foreground">{{ topic.title }}</span>
        <UiBadge :variant="TOPIC_DIFFICULTY_VARIANTS[topic.difficulty]">
          {{ t(TOPIC_DIFFICULTY_LABEL_KEYS[topic.difficulty]) }}
        </UiBadge>
        <span class="w-8 shrink-0 text-right font-mono text-xs text-muted-foreground">{{ topic.estimatedLessons }}</span>
      </li>
    </ul>

    <div class="mt-3 flex justify-end">
      <UiButton size="sm" :loading="saving" @click="emit('save')">
        <UiIcon :icon="Check" :size="16" />
        {{ t('common.save') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiBadge, UiButton, UiIcon } from '@/shared/components'
import { Check } from '@/shared/icons'
import { TOPIC_DIFFICULTY_LABEL_KEYS, TOPIC_DIFFICULTY_VARIANTS } from '../../enums/topic-difficulty.enum'
import type { AiPlan } from '../../interfaces/ai-syllabus.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ plan: AiPlan; saving?: boolean }>()
const emit = defineEmits<{ save: [] }>()

const totalLessons = computed(
  () => props.plan.totalLessons ?? props.plan.topics.reduce((sum, t) => sum + (t.estimatedLessons || 0), 0),
)
</script>
