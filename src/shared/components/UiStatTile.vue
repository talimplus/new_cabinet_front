<template>
  <component
    :is="to ? RouterLink : 'div'"
    :to="to"
    :class="cn('group flex min-w-0 flex-col rounded-lg border border-border bg-surface p-4 shadow-card', to && 'transition-shadow hover:shadow-card-hover focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none')"
  >
    <div class="flex items-center justify-between gap-2">
      <span class="text-sm font-medium text-muted-foreground">{{ label }}</span>
      <span :class="cn('grid h-8 w-8 shrink-0 place-items-center rounded-md', TONES[tone])">
        <UiIcon :icon="icon" :size="16" />
      </span>
    </div>
    <p :class="cn('mt-2 truncate font-mono text-2xl font-semibold', valueClass ?? 'text-foreground')">{{ value }}</p>
    <p v-if="hint" class="mt-1 text-xs text-muted-foreground">{{ hint }}</p>
    <slot />
    <span v-if="to" class="mt-auto flex items-center gap-1 pt-3 text-xs font-semibold text-primary">
      {{ t('common.details') }}
      <UiIcon :icon="ChevronRight" :size="14" class="transition-transform group-hover:translate-x-0.5" />
    </span>
  </component>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import { RouterLink, type RouteLocationRaw } from 'vue-router'
import { useI18n } from 'vue-i18n'
import UiIcon from './UiIcon.vue'
import { ChevronRight } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'

interface Props {
  label: string
  value: string
  icon: Component
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  /** Plain-words line under the figure: what it means. */
  hint?: string
  valueClass?: string
  /** The inner page with the full list; no link when omitted. */
  to?: RouteLocationRaw
}
withDefaults(defineProps<Props>(), { tone: 'primary', hint: undefined, valueClass: undefined, to: undefined })
const { t } = useI18n()

const TONES: Record<NonNullable<Props['tone']>, string> = {
  primary: 'bg-primary-soft text-on-primary-soft',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-muted text-muted-foreground',
}
</script>
