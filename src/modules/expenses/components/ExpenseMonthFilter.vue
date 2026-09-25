<template>
  <div class="flex flex-col gap-2">
    <div class="w-28">
      <UiSelect
        :model-value="year"
        :options="yearChoices"
        :searchable="false"
        :clearable="false"
        @update:model-value="onYear"
      />
    </div>
    <UiTabs :tabs="monthTabs" :model-value="month" @update:model-value="onMonth" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiSelect, UiTabs } from '@/shared/components'
import { currentMonth } from '../utils/month'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { TabItem } from '@/shared/interfaces/tab-item.interface'

const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const now = new Date()
const curYear = now.getFullYear()
const curMonth = now.getMonth() + 1 // 1..12

const value = computed(() => props.modelValue || currentMonth())
const year = computed(() => Number(value.value.slice(0, 4)))
const month = computed(() => value.value.slice(5, 7))

const yearChoices: SelectOption[] = [curYear - 1, curYear, curYear + 1].map((y) => ({
  label: String(y),
  value: y,
}))

/** For the current year only months up to the current one are offered; other
 *  years offer all 12. Past months are de-emphasised (mirrors old cabinet_front). */
const monthTabs = computed<TabItem[]>(() => {
  const maxMonth = year.value === curYear ? curMonth : 12
  return Array.from({ length: maxMonth }, (_, i) => {
    const m = i + 1
    const key = String(m).padStart(2, '0')
    return { key, labelKey: `common.months.${key}`, muted: isPast(year.value, m) }
  })
})

function isPast(y: number, m: number): boolean {
  return y < curYear || (y === curYear && m < curMonth)
}

function clampMonth(y: number, m: string): string {
  const max = y === curYear ? curMonth : 12
  return Number(m) > max ? String(max).padStart(2, '0') : m
}

function onYear(v: unknown): void {
  if (typeof v === 'number') emit('update:modelValue', `${v}-${clampMonth(v, month.value)}`)
}
function onMonth(v: string): void {
  emit('update:modelValue', `${year.value}-${v}`)
}
</script>
