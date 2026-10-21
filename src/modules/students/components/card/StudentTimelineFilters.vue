<template>
  <TimelineFilterChips
    :model-value="modelValue"
    :options="options"
    @update:model-value="emit('update:modelValue', $event as Cat | null)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import TimelineFilterChips from '@/shared/components/timeline/TimelineFilterChips.vue'
import {
  StudentTimelineCategory as Cat,
  TIMELINE_CATEGORY_LABEL_KEYS,
} from '../../enums/student-timeline.enum'
import type { TimelineFilterOption } from '@/shared/interfaces/timeline-entry.interface'

const props = defineProps<{
  modelValue: Cat | null
  counts: Partial<Record<Cat, number>>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Cat | null] }>()

const { t } = useI18n()

/** Chip order on screen; empty buckets get no chip. */
const ORDER: Cat[] = [Cat.PAYMENTS, Cat.GROUPS, Cat.STATUS, Cat.ATTENDANCE, Cat.PROFILE]

const options = computed<TimelineFilterOption[]>(() => {
  const total = Object.values(props.counts).reduce((sum, n) => sum + (n ?? 0), 0)
  return [
    { key: 'all', value: null, label: t('students.timeline.filters.all'), count: total },
    ...ORDER.filter((c) => (props.counts[c] ?? 0) > 0).map((c) => ({
      key: c,
      value: c,
      label: t(TIMELINE_CATEGORY_LABEL_KEYS[c]),
      count: props.counts[c] ?? 0,
    })),
  ]
})
</script>
