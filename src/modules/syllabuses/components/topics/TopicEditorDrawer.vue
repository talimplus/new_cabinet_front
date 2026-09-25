<script setup lang="ts">
import { computed } from 'vue'
import { UiModal, UiInput, UiTextarea, UiSelect, UiButton, UiIconButton } from '@/shared/components'
import { useI18n } from 'vue-i18n'
import { Trash2 } from '@/shared/icons'
import { TopicDifficulty, TOPIC_DIFFICULTY_LABEL_KEYS } from '../../enums/topic-difficulty.enum'
import { useTopicEditor } from '../../composables/use-topic-editor'
import { usePermissions } from '@/shared/composables/use-permissions'
import type { SyllabusTopic } from '../../interfaces/syllabus-topic.interface'
import TopicContentTabs from './TopicContentTabs.vue'
import TopicAiDialog from './TopicAiDialog.vue'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  syllabusId: string | number
  topic: SyllabusTopic | null
  readonly?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean]; saved: []; deleted: [] }>()

const { canUseSyllabusAi } = usePermissions()
const close = (): void => emit('update:modelValue', false)
const { form, saving, generating, aiOpen, confirmDelete, save, remove, generate } = useTopicEditor({
  syllabusId: () => props.syllabusId,
  topic: () => props.topic,
  isOpen: () => props.modelValue,
  onSaved: () => (close(), emit('saved')),
  onDeleted: () => (close(), emit('deleted')),
})

const difficultyOptions = computed(() =>
  Object.values(TopicDifficulty).map((v) => ({
    label: t(TOPIC_DIFFICULTY_LABEL_KEYS[v]),
    value: v,
  })),
)
</script>

<template>
  <UiModal
    :model-value="modelValue"
    size="xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <h2 class="min-w-0 flex-1 truncate text-base font-semibold text-foreground">
        {{ topic?.title }}
      </h2>
      <UiIconButton v-if="!readonly" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="confirmDelete = true" />
    </template>

    <div class="space-y-3">
      <UiInput v-model="form.title" :label="t('syllabuses.editor.topicTitle')" :disabled="readonly" required />
      <UiTextarea v-model="form.description" :label="t('syllabuses.editor.topicDescription')" :rows="2" :disabled="readonly" />
      <div class="grid gap-3 sm:grid-cols-2">
        <UiSelect
          :model-value="form.difficulty"
          :options="difficultyOptions"
          :label="t('syllabuses.editor.difficulty')"
          :searchable="false"
          :disabled="readonly"
          @update:model-value="form.difficulty = ($event as TopicDifficulty | null)"
        />
        <UiInput v-model="form.estimatedLessons" type="number" :label="t('syllabuses.lessonsCount')" :disabled="readonly" />
      </div>
      <TopicContentTabs
        v-model:guide="form.guide"
        v-model:lesson-outline="form.lessonOutline"
        v-model:homework="form.homework"
        :readonly="readonly"
        :can-ai="canUseSyllabusAi"
        :generating="generating"
        @generate="aiOpen = true"
      />
    </div>

    <template #footer>
      <UiButton variant="outline" @click="close">{{ readonly ? t('common.close') : t('common.cancel') }}</UiButton>
      <UiButton v-if="!readonly" :loading="saving" @click="save">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>

  <TopicAiDialog v-model="aiOpen" :loading="generating" @submit="generate" />

  <UiModal v-model="confirmDelete" :title="t('syllabuses.editor.deleteTopicTitle')" size="sm">
    <p class="text-sm text-muted-foreground">
      {{ t('syllabuses.editor.deleteTopicText', { title: topic?.title ?? '' }) }}
    </p>
    <template #footer>
      <UiButton variant="outline" @click="confirmDelete = false">{{ t('common.cancel') }}</UiButton>
      <UiButton variant="danger" @click="remove">{{ t('common.delete') }}</UiButton>
    </template>
  </UiModal>
</template>
