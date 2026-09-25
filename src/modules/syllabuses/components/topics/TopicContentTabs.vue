<script setup lang="ts">
import { ref, computed } from 'vue'
import { UiButton, UiTextarea, UiIcon, UiMarkdown } from '@/shared/components'
import { Sparkles, Pencil, Eye, BookOpen, FileText, ClipboardList } from '@/shared/icons'
import {
  TopicContentKey,
  TOPIC_CONTENT_KEYS,
  TOPIC_CONTENT_LABEL_KEYS,
} from '../../enums/topic-content-key.enum'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  guide: string
  lessonOutline: string
  homework: string
  readonly?: boolean
  /** Holder of `syllabus.ai` — otherwise the AI button is hidden. */
  canAi?: boolean
  generating?: boolean
}>()
const emit = defineEmits<{
  'update:guide': [v: string]
  'update:lessonOutline': [v: string]
  'update:homework': [v: string]
  generate: []
}>()

const ICONS = {
  [TopicContentKey.GUIDE]: BookOpen,
  [TopicContentKey.LESSON_OUTLINE]: FileText,
  [TopicContentKey.HOMEWORK]: ClipboardList,
}
const modes = computed(() => [
  { key: false, label: t('common.edit'), icon: Pencil },
  { key: true, label: t('syllabuses.content.preview'), icon: Eye },
])
const active = ref<TopicContentKey>(TopicContentKey.GUIDE)
const preview = ref(false)

const current = computed(() => props[active.value])

function onInput(v: string): void {
  if (active.value === TopicContentKey.GUIDE) emit('update:guide', v)
  else if (active.value === TopicContentKey.LESSON_OUTLINE) emit('update:lessonOutline', v)
  else emit('update:homework', v)
}
</script>

<template>
  <div>
    <div class="flex gap-1 overflow-x-auto border-b border-border">
      <button
        v-for="key in TOPIC_CONTENT_KEYS"
        :key="key"
        type="button"
        class="-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap"
        :class="active === key ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'"
        @click="active = key"
      >
        <UiIcon :icon="ICONS[key]" :size="14" :class="props[key].trim() ? 'text-success' : ''" />
        {{ t(TOPIC_CONTENT_LABEL_KEYS[key]) }}
      </button>
    </div>

    <div v-if="!readonly" class="mt-3 flex items-center gap-2">
      <div class="flex rounded-md border border-border p-0.5">
        <button
          v-for="m in modes"
          :key="String(m.key)"
          type="button"
          class="flex items-center gap-1 rounded px-2 py-1 text-xs"
          :class="preview === m.key ? 'bg-surface-muted text-foreground' : 'text-muted-foreground'"
          @click="preview = m.key"
        >
          <UiIcon :icon="m.icon" :size="13" /> {{ m.label }}
        </button>
      </div>
      <UiButton v-if="canAi" size="sm" variant="secondary" class="ml-auto" :loading="generating" @click="emit('generate')">
        <UiIcon :icon="Sparkles" :size="15" /> {{ t('syllabuses.ai.generate') }}
      </UiButton>
    </div>

    <UiTextarea
      v-if="!preview && !readonly"
      :model-value="current"
      :rows="14"
      class="mt-3 font-mono"
      :placeholder="t('syllabuses.content.editorPlaceholder')"
      @update:model-value="onInput"
    />
    <div v-else class="mt-3 max-h-[50vh] min-h-40 overflow-y-auto rounded-md border border-border p-4">
      <UiMarkdown v-if="current.trim()" :source="current" />
      <p v-else class="text-sm text-muted-foreground">{{ t('syllabuses.content.notFilled') }}</p>
    </div>
  </div>
</template>
