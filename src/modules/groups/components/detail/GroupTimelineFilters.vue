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
  GroupTimelineCategory as Cat,
  GROUP_TIMELINE_CATEGORY_LABEL_KEYS,
} from '../../enums/group-timeline.enum'
import type { TimelineFilterOption } from '@/shared/interfaces/timeline-entry.interface'

const props = defineProps<{
  modelValue: Cat | null
  counts: Partial<Record<Cat, number>>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Cat | null] }>()

const { t } = useI18n()

/** Chip order on screen; GROUP (created / started / ended) shows under "all" only. */
const ORDER: Cat[] = [Cat.TEACHER, Cat.SCHEDULE, Cat.FEE, Cat.PAUSE, Cat.STUDENTS]

const options = computed<TimelineFilterOption[]>(() => {
  const total = Object.values(props.counts).reduce((sum, n) => sum + (n ?? 0), 0)
  return [
    { key: 'all', value: null, label: t('groups.timeline.filters.all'), count: total },
    ...ORDER.filter((c) => (props.counts[c] ?? 0) > 0).map((c) => ({
      key: c,
      value: c,
      label: t(GROUP_TIMELINE_CATEGORY_LABEL_KEYS[c]),
      count: props.counts[c] ?? 0,
    })),
  ]
})
</script>
