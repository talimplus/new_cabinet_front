<template>
  <div v-if="loading && !hasItems" class="py-6 text-center">
    <UiSpinner :size="20" class="mx-auto text-muted-foreground" />
  </div>

  <div v-else-if="failed" class="space-y-2 py-4 text-center">
    <p class="text-sm text-muted-foreground">{{ t('common.timeline.loadError') }}</p>
    <UiButton size="sm" variant="outline" @click="emit('retry')">{{ t('common.timeline.retry') }}</UiButton>
  </div>

  <p v-else-if="!days.length" class="py-6 text-center text-sm text-muted-foreground">
    {{ hasItems ? emptyFilteredText : emptyText }}
  </p>

  <div v-else class="max-w-3xl space-y-6">
    <div v-for="day in days" :key="day.key">
      <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ day.label }}</p>
      <ol>
        <TimelineEntry
          v-for="(entry, i) in day.entries"
          :key="entry.id"
          :entry="entry"
          :last="i === day.entries.length - 1"
        />
      </ol>
    </div>

    <UiButton v-if="remaining" variant="ghost" block @click="emit('showMore')">
      {{ t('common.timeline.showMore', { count: remaining }) }}
    </UiButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import UiButton from '../UiButton.vue'
import UiSpinner from '../UiSpinner.vue'
import TimelineEntry from './TimelineEntry.vue'
import type { TimelineDay } from '@/shared/interfaces/timeline-entry.interface'

/**
 * The body of a timeline: loading / error / empty states, then entries grouped
 * by day with a "show more" pager. Filtering and paging live in the caller.
 */
defineProps<{
  days: TimelineDay[]
  /** Anything loaded at all — tells "nothing yet" from "nothing in this filter". */
  hasItems: boolean
  loading: boolean
  failed: boolean
  remaining: number
  emptyText: string
  emptyFilteredText: string
}>()
const emit = defineEmits<{ retry: []; showMore: [] }>()

const { t } = useI18n()
</script>
