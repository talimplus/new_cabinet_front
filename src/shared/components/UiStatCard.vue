<template>
  <div class="rounded-lg border border-border bg-surface p-4 shadow-card">
    <div class="flex items-center justify-between gap-2">
      <span class="truncate text-xs font-medium text-muted-foreground">{{ label }}</span>
      <span :class="cn('grid h-8 w-8 shrink-0 place-items-center rounded-md', tones[tone])">
        <UiIcon :icon="icon" :size="16" />
      </span>
    </div>
    <p :class="cn('mt-3 truncate font-mono text-2xl font-semibold', valueClass)">
      {{ value }}
    </p>
    <!-- Secondary line: a count, a share, a caveat — whatever qualifies the figure. -->
    <p v-if="hint" class="mt-0.5 truncate text-xs text-muted-foreground">{{ hint }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'
import UiIcon from './UiIcon.vue'
import { cn } from '@/shared/utils/cn'

interface Props {
  label: string
  value: string
  icon: Component
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  hint?: string
  /** Tint the figure itself in the tone colour, not just the icon box. */
  colored?: boolean
}

const props = withDefaults(defineProps<Props>(), { tone: 'primary' })

const tones: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-primary-soft text-on-primary-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-muted text-muted-foreground',
}

const coloredValues: Record<NonNullable<Props['tone']>, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-foreground',
}

const valueClass = computed(() =>
  props.colored ? coloredValues[props.tone] : 'text-foreground',
)
</script>
