<template>
  <div class="space-y-2">
    <div class="flex flex-wrap items-center gap-2">
      <div class="flex rounded-md border border-border bg-surface p-0.5 shadow-card" role="group" :aria-label="t('statistics.period.label')">
        <button
          v-for="p in quick"
          :key="p"
          type="button"
          :aria-pressed="preset === p"
          :class="cn('h-10 rounded-sm px-3 text-sm font-semibold transition-colors md:h-8', preset === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')"
          @click="emit('preset', p)"
        >
          {{ t(DATE_PRESET_LABEL_KEYS[p]) }}
        </button>
        <button
          type="button"
          :aria-pressed="showPicker"
          :aria-label="t('statistics.period.custom')"
          :title="t('statistics.period.custom')"
          :class="cn('grid h-10 w-10 place-items-center rounded-sm transition-colors md:h-8 md:w-9', showPicker ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')"
          @click="toggleCalendar"
        >
          <UiIcon :icon="CalendarRange" :size="16" />
        </button>
      </div>
      <span class="min-w-0 font-mono text-sm text-muted-foreground">{{ label }}</span>
    </div>
    <!-- Two plain pickers (from / to): a single range calendar was unreliable on phones. -->
    <div v-if="showPicker" class="grid grid-cols-2 gap-2 sm:max-w-md">
      <UiDatepicker
        ref="fromPicker"
        :model-value="from"
        :label="t('statistics.period.from')"
        :clearable="false"
        :max-date="to ?? undefined"
        @update:model-value="pickFrom"
      />
      <UiDatepicker
        :model-value="to"
        :label="t('statistics.period.to')"
        :clearable="false"
        :min-date="from ?? undefined"
        @update:model-value="pickTo"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiDatepicker, UiIcon } from '@/shared/components'
import { CalendarRange } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { parseDate, toDateString } from '@/shared/utils/format-date'
import { DatePreset, DATE_PRESET_LABEL_KEYS } from '../enums/date-preset.enum'
import type { StatsRangeParams } from '../interfaces/stats-overview.interface'

const { t } = useI18n()
const props = defineProps<{ range: StatsRangeParams; preset: DatePreset; label: string }>()
const emit = defineEmits<{ preset: [value: DatePreset]; range: [value: StatsRangeParams] }>()

const quick = [DatePreset.TODAY, DatePreset.WEEK, DatePreset.MONTH]
const fromPicker = ref<{ open: () => void } | null>(null)
const opened = ref<boolean | null>(null)
/** Open by default for a custom period; the icon toggles it either way. */
const showPicker = computed(() => opened.value ?? props.preset === DatePreset.CUSTOM)
const from = computed(() => parseDate(props.range.fromDate))
const to = computed(() => parseDate(props.range.toDate))

async function toggleCalendar(): Promise<void> {
  opened.value = !showPicker.value
  if (!opened.value) return
  await nextTick()
  fromPicker.value?.open()
}

const day = (v: Date | Date[] | null): string | null => {
  const d = Array.isArray(v) ? v[0] : v
  return d ? toDateString(d) : null
}

/** A start after the end pulls the end along (and vice versa) — never an empty range. */
function pickFrom(value: Date | Date[] | null): void {
  const fromDate = day(value)
  if (!fromDate) return
  emit('range', { fromDate, toDate: props.range.toDate >= fromDate ? props.range.toDate : fromDate })
}
function pickTo(value: Date | Date[] | null): void {
  const toDate = day(value)
  if (!toDate) return
  emit('range', { fromDate: props.range.fromDate <= toDate ? props.range.fromDate : toDate, toDate })
}
</script>
