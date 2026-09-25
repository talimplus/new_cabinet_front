<template>
  <div class="flex gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1">
    <button
      v-for="m in months"
      :key="m.value"
      type="button"
      :class="cn(
        'h-11 shrink-0 rounded-md px-3 text-sm font-medium transition-colors md:h-8',
        m.value === modelValue
          ? 'bg-primary text-primary-foreground'
          : isPast(m.value)
            ? 'text-fg-subtle hover:bg-surface-muted'
            : 'text-muted-foreground hover:bg-surface-muted',
      )"
      @click="emit('change', m.value)"
    >
      {{ t(m.labelKey) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import { PAYMENT_MONTHS } from '../config/payment-months'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{ modelValue: string; year: number }>()
const emit = defineEmits<{ change: [month: string] }>()

const now = new Date()
const currentYear = now.getFullYear()
const currentMonth = now.getMonth() + 1

/**
 * Months that can actually hold payments. In the current year the strip stops
 * at this month — a month that has not started yet has no invoices. Other years
 * show all twelve.
 */
const months = computed(() =>
  props.year === currentYear ? PAYMENT_MONTHS.slice(0, currentMonth) : PAYMENT_MONTHS,
)

/** A month strictly before the current month of the selected year — dimmed. */
function isPast(value: string): boolean {
  const month = Number(value)
  if (props.year < currentYear) return true
  return props.year === currentYear && month < currentMonth
}
</script>
