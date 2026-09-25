<template>
  <div class="border-t border-border p-3">
    <p class="mb-2 text-xs font-medium text-muted-foreground">{{ t('groups.plan.selectTopics') }}</p>
    <div class="flex max-h-64 flex-col gap-2 overflow-y-auto">
      <UiCheckbox
        v-for="topic in topics"
        :key="topic.id"
        :model-value="selectedIds.includes(topic.id)"
        @update:model-value="(v: boolean) => emit('toggle', { topicId: topic.id, checked: v })"
      >
        <span class="inline-flex items-center gap-2">
          <span
            v-if="topic.difficulty"
            :class="cn('h-2 w-2 shrink-0 rounded-full', DOT[topic.difficulty])"
          />
          {{ topic.title }}
        </span>
      </UiCheckbox>
    </div>
    <div class="mt-3 flex justify-end">
      <UiButton size="sm" :disabled="!dirty" :loading="saving" @click="emit('save')">
        {{ t('common.save') }}
      </UiButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiCheckbox, UiButton } from '@/shared/components'
import { cn } from '@/shared/utils/cn'
import { TopicDifficulty } from '../../enums/topic-difficulty.enum'
import type { PlanTopic } from '../../interfaces/group-plan.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

interface Props {
  topics: PlanTopic[]
  selectedIds: number[]
  saving?: boolean
  dirty?: boolean
}
defineProps<Props>()
const emit = defineEmits<{
  toggle: [payload: { topicId: number; checked: boolean }]
  save: []
}>()

const DOT: Record<TopicDifficulty, string> = {
  [TopicDifficulty.EASY]: 'bg-success',
  [TopicDifficulty.MEDIUM]: 'bg-warning',
  [TopicDifficulty.HARD]: 'bg-danger',
}
</script>
