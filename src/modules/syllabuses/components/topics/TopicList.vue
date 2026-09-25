<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import TopicCard from './TopicCard.vue'
import type { SyllabusTopic } from '../../interfaces/syllabus-topic.interface'

const { t } = useI18n()

defineProps<{ topics: SyllabusTopic[]; editable?: boolean }>()
const emit = defineEmits<{ open: [topic: SyllabusTopic]; reorder: [from: number, to: number] }>()

const dragIndex = ref<number | null>(null)
const overIndex = ref<number | null>(null)

function onDragStart(index: number, e: DragEvent): void {
  dragIndex.value = index
  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', String(index))
  }
}
function onDrop(target: number): void {
  const from = dragIndex.value
  overIndex.value = null
  dragIndex.value = null
  if (from !== null) emit('reorder', from, target)
}
function onEnd(): void {
  dragIndex.value = null
  overIndex.value = null
}
</script>

<template>
  <p v-if="!topics.length" class="py-10 text-center text-sm text-muted-foreground">
    {{ t('syllabuses.editor.noTopics') }}
  </p>
  <ul v-else class="space-y-2">
    <TopicCard
      v-for="(topic, index) in topics"
      :key="topic.id"
      :topic="topic"
      :order="index + 1"
      :editable="editable"
      :first="index === 0"
      :last="index === topics.length - 1"
      :dragging="dragIndex === index"
      :drag-over="overIndex === index && dragIndex !== index"
      :draggable="editable"
      @dragstart="editable && onDragStart(index, $event)"
      @dragover.prevent="editable && (overIndex = index)"
      @dragleave="overIndex === index && (overIndex = null)"
      @drop.prevent="editable && onDrop(index)"
      @dragend="onEnd"
      @open="emit('open', topic)"
      @move-up="emit('reorder', index, index - 1)"
      @move-down="emit('reorder', index, index + 1)"
    />
  </ul>
</template>
