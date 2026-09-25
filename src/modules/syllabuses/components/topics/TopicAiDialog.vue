<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiTextarea, UiButton, UiIcon } from '@/shared/components'
import { Sparkles } from '@/shared/icons'
import type { GenerateContentPayload } from '../../interfaces/generate-content-payload.interface'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean; loading?: boolean }>()
const emit = defineEmits<{
  'update:modelValue': [v: boolean]
  submit: [payload: GenerateContentPayload]
}>()

const form = reactive({ audience: '', instructions: '' })

watch(
  () => props.modelValue,
  (open) => {
    if (open) Object.assign(form, { audience: '', instructions: '' })
  },
)

function submit(): void {
  emit('submit', {
    audience: form.audience.trim() || undefined,
    instructions: form.instructions.trim() || undefined,
  })
}
</script>

<template>
  <UiModal
    :model-value="modelValue"
    :title="t('syllabuses.ai.generate')"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-3">
      <p class="text-sm text-muted-foreground">
        {{ t('syllabuses.ai.generateHint') }}
      </p>
      <UiInput v-model="form.audience" :label="t('syllabuses.ai.audience')" :placeholder="t('syllabuses.ai.audiencePlaceholder')" />
      <UiTextarea v-model="form.instructions" :label="t('syllabuses.ai.instructions')" :rows="3" />
    </div>
    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="submit">
        <UiIcon :icon="Sparkles" :size="15" /> Yaratish
      </UiButton>
    </template>
  </UiModal>
</template>
