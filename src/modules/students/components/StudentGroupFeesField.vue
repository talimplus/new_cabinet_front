<template>
  <div v-if="groups.length" class="space-y-2">
    <p class="text-sm font-semibold text-foreground">{{ t('students.form.groupFees') }}</p>
    <div class="grid gap-3 sm:grid-cols-2">
      <UiMoneyInput
        v-for="g in groups"
        :key="g.value as number"
        :model-value="modelValue[g.value as number] ?? ''"
        :label="g.label"
        :placeholder="t('students.form.groupFeePlaceholder')"
        :hint="hintFor(g)"
        @update:model-value="set(g.value as number, $event)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiMoneyInput } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonthName } from '@/shared/utils/format-month'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

/**
 * Personal price per selected group. Empty — the group's own price (shown in
 * the hint). A student in a 200k and a 500k group gets a price for each.
 */
const { t } = useI18n()

const props = defineProps<{
  /** Selected group options (`fee` — the group's price). */
  groups: SelectOption[]
  modelValue: Record<number, string | number>
  /** Prices set in a paid month — they start next month. */
  upcoming?: Record<number, { fee: number; from: string }>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Record<number, string | number>] }>()

function set(groupId: number, value: unknown): void {
  const next = typeof value === 'number' || typeof value === 'string' ? value : ''
  emit('update:modelValue', { ...props.modelValue, [groupId]: next })
}

function hintFor(g: SelectOption): string {
  const up = props.upcoming?.[g.value as number]
  if (up) return t('students.form.groupFeeUpcoming', { month: formatMonthName(up.from) })
  return t('students.form.groupFeeHint', { amount: formatSom(Number(g.fee ?? 0)) })
}
</script>
