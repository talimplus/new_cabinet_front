<template>
  <button
    type="button"
    role="menuitem"
    :disabled="disabled"
    :class="cn(
      'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
      danger ? 'text-danger hover:bg-danger-soft' : 'text-foreground hover:bg-surface-muted',
      'disabled:pointer-events-none disabled:opacity-50',
    )"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'

interface Props {
  danger?: boolean
  disabled?: boolean
}

defineProps<Props>()
</script>
