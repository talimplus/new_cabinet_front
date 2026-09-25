<template>
  <UiModal
    :model-value="open"
    size="lg"
    :title="t('syllabuses.aiChat.title')"
    @update:model-value="open = $event"
  >
    <div class="flex flex-col gap-3">
      <UiSelect
        :model-value="subjectId"
        :options="subjectOptions"
        :label="t('syllabuses.aiChat.subject')"
        :placeholder="t('syllabuses.selectSubject')"
        @update:model-value="subjectId = toNum($event)"
      />

      <div
        class="min-h-[280px] max-h-[48vh] space-y-3 overflow-y-auto rounded-lg border border-border bg-surface-muted p-3"
      >
        <div
          v-if="!messages.length && !loading"
          class="flex min-h-[240px] flex-col items-center justify-center gap-2 text-center text-muted-foreground"
        >
          <UiIcon :icon="MessageSquare" :size="36" />
          <p class="text-sm">{{ t('syllabuses.aiChat.placeholderExample') }}</p>
        </div>

        <ChatMessage v-for="(m, i) in messages" :key="i" :message="m" />

        <PlanPreview v-if="currentPlan" :plan="currentPlan" :saving="saving" @save="onSave" />

        <div v-if="loading" class="flex items-center gap-2 text-muted-foreground">
          <UiSpinner :size="16" />
          <span class="text-sm">{{ t('syllabuses.aiChat.typing') }}</span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex w-full items-end gap-2">
        <div class="flex-1">
          <UiTextarea v-model="input" :rows="1" :placeholder="t('syllabuses.aiChat.inputPlaceholder')" :disabled="loading" />
        </div>
        <UiButton :loading="loading" :disabled="!input.trim()" @click="send">
          <UiIcon :icon="Send" :size="16" />
        </UiButton>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { UiModal, UiSelect, UiTextarea, UiButton, UiIcon, UiSpinner } from '@/shared/components'
import { Send, MessageSquare } from '@/shared/icons'
import ChatMessage from './ai/ChatMessage.vue'
import PlanPreview from './ai/PlanPreview.vue'
import { useAiSyllabus } from '../composables/use-ai-syllabus'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ subjectOptions: SelectOption[] }>()
const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ created: [message: string] }>()

const { subjectId, messages, input, loading, currentPlan, saving, send, savePlan, reset } =
  useAiSyllabus((message) => emit('created', message))

const toNum = (v: unknown): number | null => (typeof v === 'number' ? v : null)

async function onSave() {
  const created = await savePlan()
  if (created) open.value = false
}

watch(open, (value) => {
  if (!value) reset()
})
</script>
