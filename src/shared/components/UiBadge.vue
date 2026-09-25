<template>
  <span :class="cn(base, variants[variant])">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'

interface Props {
  variant?: 'primary' | 'neutral' | 'success' | 'warning' | 'danger' | 'info'
}

withDefaults(defineProps<Props>(), { variant: 'neutral' })

const base =
  'inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium whitespace-nowrap'

const variants: Record<NonNullable<Props['variant']>, string> = {
  primary: 'bg-primary-soft text-primary',
  neutral: 'bg-surface-muted text-muted-foreground',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
}
</script>
