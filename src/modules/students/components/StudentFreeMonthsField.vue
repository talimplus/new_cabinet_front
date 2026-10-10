<template>
  <div class="space-y-2">
    <div class="sm:max-w-xs">
      <UiSelect
        :model-value="freeMonths"
        :options="options"
        :label="t('students.form.freeMonths')"
        :searchable="false"
        :clearable="false"
        @update:model-value="freeMonths = typeof $event === 'number' ? $event : 0"
      />
    </div>
    <p class="text-xs text-muted-foreground">{{ t('students.form.freeMonthsHint') }}</p>
    <p v-if="period" class="text-xs font-semibold text-foreground">{{ period }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiSelect } from '@/shared/components'
import { formatDate, parseDate, toDateString } from '@/shared/utils/format-date'
import type { FreeWindow } from '../interfaces/student.interface'

const { t } = useI18n()

/** The stored window — shown only while the picked count matches it. */
const props = defineProps<{ window?: FreeWindow | null; storedMonths?: number }>()
const freeMonths = defineModel<number>('freeMonths', { default: 0 })

/** 0 is "none" and the default, so an accidental save never writes a free month. */
const options = computed(() =>
  [0, 1, 2, 3].map((n) => ({
    value: n,
    label: n ? t('students.form.freeMonthsOption', { n }) : t('students.form.freeMonthsNone'),
  })),
)

const period = computed(() => {
  const w = props.window
  if (!w || !freeMonths.value || freeMonths.value !== props.storedMonths) return ''
  // The window's end is exclusive — show the last free day.
  const end = parseDate(w.untilExclusive)
  end?.setDate(end.getDate() - 1)
  const last = toDateString(end)
  return t('students.form.freeWindow', { from: formatDate(w.from), to: formatDate(last) })
})
</script>
