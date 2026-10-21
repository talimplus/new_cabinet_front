<template>
  <!-- Scrolls inside itself on a phone — the page never scrolls sideways. -->
  <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors md:h-8"
      :class="option.value === modelValue
        ? 'bg-primary text-primary-foreground'
        : 'bg-surface-muted text-muted-foreground hover:text-foreground'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
      <span class="font-mono text-xs opacity-80">{{ option.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { TimelineFilterOption } from '@/shared/interfaces/timeline-entry.interface'

defineProps<{
  modelValue: string | null
  options: TimelineFilterOption[]
}>()
const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
</script>
