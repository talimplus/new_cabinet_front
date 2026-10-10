<template>
  <button
    type="button"
    role="switch"
    :aria-checked="model"
    :aria-label="label"
    :disabled="disabled"
    :class="cn(
      'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
      model ? 'bg-primary' : 'bg-input',
      disabled && 'cursor-not-allowed opacity-50',
    )"
    @click="model = !model"
  >
    <span
      :class="cn(
        'pointer-events-none inline-block h-5 w-5 rounded-full bg-surface shadow-card transition-transform',
        model ? 'translate-x-5' : 'translate-x-0.5',
      )"
    />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'

/** On/off toggle. `label` is the accessible name (render visible text beside it). */
defineProps<{ label?: string; disabled?: boolean }>()
const model = defineModel<boolean>({ default: false })
</script>
