<template>
  <!-- Scrolls inside itself on a phone — the page never scrolls sideways. -->
  <div class="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="tablist">
    <button
      v-for="option in options"
      :key="option.key"
      type="button"
      role="tab"
      :aria-selected="option.value === modelValue"
      class="inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors md:h-8"
      :class="option.value === modelValue
        ? 'bg-primary text-primary-foreground'
        : 'bg-surface-muted text-muted-foreground hover:text-foreground'"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
      <span class="font-mono text-xs opacity-80">{{ option.count }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  StudentTimelineCategory as Cat,
  TIMELINE_CATEGORY_LABEL_KEYS,
} from '../../enums/student-timeline.enum'

const props = defineProps<{
  modelValue: Cat | null
  counts: Partial<Record<Cat, number>>
}>()
const emit = defineEmits<{ 'update:modelValue': [value: Cat | null] }>()

const { t } = useI18n()

/** Chip order on screen; empty buckets get no chip. */
const ORDER: Cat[] = [Cat.PAYMENTS, Cat.GROUPS, Cat.STATUS, Cat.ATTENDANCE, Cat.PROFILE]

const options = computed(() => {
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
