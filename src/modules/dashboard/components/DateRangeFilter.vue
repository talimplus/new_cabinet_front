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
        <!-- The icon IS the calendar trigger: no input field, the calendar opens right under it. -->
        <UiDatepicker
          range
          :clearable="false"
          :model-value="dates"
          @update:model-value="onPick"
        >
          <template #trigger>
            <button
              type="button"
              :aria-pressed="preset === DatePreset.CUSTOM"
              :aria-label="t('statistics.period.custom')"
              :title="t('statistics.period.custom')"
              :class="cn('grid h-10 w-10 place-items-center rounded-sm transition-colors md:h-8 md:w-9', preset === DatePreset.CUSTOM ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')"
            >
              <UiIcon :icon="CalendarRange" :size="16" />
            </button>
          </template>
        </UiDatepicker>
      </div>
      <span class="min-w-0 font-mono text-sm text-muted-foreground">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
const dates = computed(() => [parseDate(props.range.fromDate), parseDate(props.range.toDate)].filter((d): d is Date => !!d))

/** The picker emits only a complete range (`partialRange: false` in UiDatepicker). */
function onPick(value: Date | Date[] | null): void {
  if (!Array.isArray(value) || !value[0]) return
  const a = toDateString(value[0])
  const b = toDateString(value[1] ?? value[0])
  emit('range', a <= b ? { fromDate: a, toDate: b } : { fromDate: b, toDate: a })
}
</script>
