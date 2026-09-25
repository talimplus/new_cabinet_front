<template>
  <button
    type="button"
    :disabled="disabled"
    :title="label"
    :aria-label="label"
    :class="
      cn(
        // ≥44px touch target on phones, compact on desktop (ui-and-forms.md §4.2)
        'inline-flex h-11 w-11 items-center justify-center rounded-md transition-colors',
        'md:h-8 md:w-8',
        'disabled:pointer-events-none disabled:opacity-40',
        tones[tone],
      )
    "
  >
    <UiIcon :icon="icon" :size="16" />
  </button>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import UiIcon from './UiIcon.vue'
import { cn } from '@/shared/utils/cn'

interface Props {
  icon: Component
  /** Accessible name — also the native tooltip. */
  label?: string
  tone?: 'default' | 'primary' | 'danger' | 'success'
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { tone: 'default' })

const tones: Record<NonNullable<Props['tone']>, string> = {
  default: 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
  primary: 'text-muted-foreground hover:bg-surface-muted hover:text-primary',
  danger: 'text-muted-foreground hover:bg-danger-soft hover:text-danger',
  success: 'text-muted-foreground hover:bg-success-soft hover:text-success',
}
</script>
