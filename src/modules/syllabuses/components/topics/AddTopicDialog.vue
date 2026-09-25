<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiTextarea, UiSelect, UiButton } from '@/shared/components'
import { TopicDifficulty, TOPIC_DIFFICULTY_LABEL_KEYS } from '../../enums/topic-difficulty.enum'
import type { TopicForm } from '../../interfaces/topic-form.interface'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean]; submit: [form: TopicForm] }>()

const form = reactive({
  title: '',
  description: '',
  difficulty: null as TopicDifficulty | null,
  estimatedLessons: '' as number | string,
})

const difficultyOptions = computed(() =>
  Object.values(TopicDifficulty).map((v) => ({
    label: t(TOPIC_DIFFICULTY_LABEL_KEYS[v]),
    value: v,
  })),
)

watch(
  () => props.modelValue,
  (open) => {
    if (open) Object.assign(form, { title: '', description: '', difficulty: null, estimatedLessons: '' })
  },
)

function submit(): void {
  if (!form.title.trim()) return
  emit('submit', {
    title: form.title.trim(),
    description: form.description.trim() || undefined,
    difficulty: form.difficulty || undefined,
    estimatedLessons: form.estimatedLessons === '' ? undefined : Number(form.estimatedLessons),
  })
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="t('syllabuses.editor.addTopic')"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3">
      <UiInput v-model="form.title" :label="t('syllabuses.editor.topicTitle')" required />
      <UiTextarea v-model="form.description" :label="t('syllabuses.editor.topicDescription')" :rows="2" />
      <div class="grid gap-3 sm:grid-cols-2">
        <UiSelect
          :model-value="form.difficulty"
          :options="difficultyOptions"
          :label="t('syllabuses.editor.difficulty')"
          :searchable="false"
          @update:model-value="form.difficulty = ($event as TopicDifficulty | null)"
        />
        <UiInput v-model="form.estimatedLessons" type="number" :label="t('syllabuses.lessonsCount')" />
      </div>
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :disabled="!form.title.trim()" @click="submit">{{ t('common.add') }}</UiButton>
    </template>
  </UiModal>
</template>
