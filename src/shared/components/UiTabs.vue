<template>
  <div class="flex gap-1 overflow-x-auto border-b border-border" role="tablist">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      role="tab"
      :aria-selected="tab.key === modelValue"
      :class="
        cn(
          'relative flex h-11 shrink-0 items-center gap-2 px-4 text-sm font-semibold whitespace-nowrap transition-colors',
          tab.key === modelValue ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
          tab.muted && tab.key !== modelValue && 'opacity-60',
        )
      "
      @click="emit('update:modelValue', tab.key)"
    >
      {{ t(tab.labelKey) }}
      <UiBadge v-if="tab.badge" :variant="tab.badgeAlert ? 'danger' : 'neutral'">
        {{ tab.badge }}
      </UiBadge>
      <span
        v-if="tab.key === modelValue"
        class="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
      />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import UiBadge from './UiBadge.vue'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const { t } = useI18n()

defineProps<{ tabs: TabItem[]; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
</script>
