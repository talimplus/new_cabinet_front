<template>
  <div class="flex items-start justify-between gap-3 text-sm">
    <span class="shrink-0 text-muted-foreground">{{ label }}</span>
    <span :class="cn('min-w-0 text-right font-mono text-foreground', strong && 'font-semibold')">
      <slot>{{ value }}</slot>
    </span>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'

defineProps<{ label: string; value?: string | number; strong?: boolean }>()
</script>
