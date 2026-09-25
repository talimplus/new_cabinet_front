<template>
  <div class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
    <button
      v-for="m in months"
      :key="m.value"
      type="button"
      :class="
        cn(
          'h-11 shrink-0 rounded-md px-3 text-sm font-medium transition-colors md:h-9',
          m.value === modelValue
            ? 'bg-primary text-primary-foreground'
            : isPast(m.value)
              ? 'text-fg-subtle hover:bg-surface-muted'
              : 'text-muted-foreground hover:bg-surface-muted',
        )
      "
      @click="emit('update:modelValue', m.value)"
    >
      {{ t(m.labelKey) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'
import type { MonthOption } from '../config/payroll-months'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

/** `months` is already clamped to the center's opening and to today. */
const props = defineProps<{ modelValue: string; months: MonthOption[]; year: number }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const now = new Date()

/** A closed month is dimmed — the current one is where the work happens. */
function isPast(value: string): boolean {
  if (props.year < now.getFullYear()) return true
  return props.year === now.getFullYear() && Number(value) < now.getMonth() + 1
}
</script>
