<template>
  <div class="overflow-hidden rounded-lg border border-border bg-surface">
    <button
      type="button"
      class="flex min-h-11 w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-surface-muted"
      :aria-expanded="open"
      @click="open = !open"
    >
      <UiIcon
        :icon="ChevronDown"
        :size="18"
        :class="cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')"
      />
      <span class="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        <slot name="title">{{ title }}</slot>
      </span>
      <slot name="meta" />
    </button>

    <div v-if="open" class="border-t border-border px-3 py-3">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import UiIcon from './UiIcon.vue'
import { ChevronDown } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'

interface Props {
  title?: string
}

defineProps<Props>()

/** Open state is two-way so a parent can expand/collapse a whole list. */
const open = defineModel<boolean>('open', { default: false })
</script>
