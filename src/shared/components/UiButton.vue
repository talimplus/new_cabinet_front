<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="cn(base, variants[variant], sizes[size], block && 'w-full')"
  >
    <UiSpinner v-if="loading" :size="size === 'lg' ? 18 : 16" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'
import UiSpinner from './UiSpinner.vue'

// UI-only variant/size literals live inline (not backend values → no enum).
interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-semibold ' +
  'transition-all duration-150 hover:-translate-y-px active:translate-y-0 active:scale-[0.98] ' +
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
  'disabled:pointer-events-none disabled:opacity-50 whitespace-nowrap select-none'

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-primary-hover shadow-card',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-surface-muted',
  outline: 'border border-input bg-surface text-foreground hover:bg-surface-muted',
  ghost: 'text-foreground hover:bg-surface-muted',
  danger: 'bg-danger text-danger-foreground hover:brightness-95 shadow-card',
}

// 44px touch targets on phones, the compact desktop heights from `md` up
// (ui-and-forms.md §4.2). Same pattern as UiIconButton.
const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'h-11 px-3 text-xs md:h-8',
  md: 'h-11 px-3.5 text-sm md:h-9',
  lg: 'h-11 px-6 text-base',
}
</script>
