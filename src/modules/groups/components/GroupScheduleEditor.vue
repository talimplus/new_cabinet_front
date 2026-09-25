<template>
  <div class="space-y-3 rounded-lg border border-border p-3">
    <p class="text-sm font-medium text-foreground">Dars jadvali</p>

    <UiSelect
      :model-value="days"
      :options="dayOptions"
      mode="tags"
      :label="t('groups.form.days')"
      :searchable="false"
      :placeholder="t('groups.form.selectDaysPlaceholder')"
      @update:model-value="days = ($event as WeekDay[])"
    />

    <UiCheckbox v-model="differentTime" :label="t('groups.form.perDayTime')" />

    <UiInput v-if="!differentTime" v-model="allTime" type="time" :label="t('groups.form.lessonTime')" />

    <div v-else class="space-y-2">
      <div v-for="(day, i) in days" :key="day" class="flex items-center gap-3">
        <span class="w-24 shrink-0 text-sm text-muted-foreground">{{ t(labelKeys[day]) }}</span>
        <div class="flex-1">
          <UiInput :model-value="times[i] ?? ''" type="time" @update:model-value="setTime(i, String($event))" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UiSelect, UiCheckbox, UiInput } from '@/shared/components'
import { WEEK_DAY_LABEL_KEYS, type WeekDay } from '../enums/week-day.enum'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const days = defineModel<WeekDay[]>('days', { default: () => [] })
const allTime = defineModel<string>('allTime', { default: '' })
const times = defineModel<string[]>('times', { default: () => [] })
const differentTime = defineModel<boolean>('differentTime', { default: false })

defineProps<{ dayOptions: SelectOption[] }>()

const labelKeys = WEEK_DAY_LABEL_KEYS

function setTime(index: number, value: string): void {
  const next = [...times.value]
  next[index] = value
  times.value = next
}
</script>
