<template>
  <section class="rounded-lg border border-border bg-surface shadow-card">
    <header class="space-y-3 border-b border-border p-4">
      <div>
        <h3 class="flex items-center gap-2 text-base font-semibold text-foreground">
          <UiIcon :icon="History" :size="18" class="text-primary" />
          {{ t('students.timeline.heading') }}
        </h3>
        <p class="mt-0.5 text-sm text-muted-foreground">{{ t('students.timeline.subtitle') }}</p>
      </div>
      <StudentTimelineFilters
        v-if="tl.items.value.length"
        :model-value="tl.category.value"
        :counts="tl.counts.value"
        @update:model-value="tl.setCategory"
      />
    </header>

    <div class="p-4">
      <div v-if="tl.loading.value && !tl.items.value.length" class="py-6 text-center">
        <UiSpinner :size="20" class="mx-auto text-muted-foreground" />
      </div>

      <div v-else-if="tl.failed.value" class="space-y-2 py-4 text-center">
        <p class="text-sm text-muted-foreground">{{ t('students.timeline.loadError') }}</p>
        <UiButton size="sm" variant="outline" @click="tl.load">{{ t('students.timeline.retry') }}</UiButton>
      </div>

      <p v-else-if="!tl.days.value.length" class="py-6 text-center text-sm text-muted-foreground">
        {{ t(tl.items.value.length ? 'students.timeline.emptyFiltered' : 'students.timeline.empty') }}
      </p>

      <div v-else class="max-w-3xl space-y-6">
        <div v-for="day in tl.days.value" :key="day.key">
          <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{{ day.label }}</p>
          <ol>
            <StudentTimelineEntry
              v-for="(entry, i) in day.entries"
              :key="entry.id"
              :entry="entry"
              :last="i === day.entries.length - 1"
            />
          </ol>
        </div>

        <UiButton v-if="tl.remaining.value" variant="ghost" block @click="tl.showMore">
          {{ t('students.timeline.showMore', { count: tl.remaining.value }) }}
        </UiButton>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiSpinner } from '@/shared/components'
import { History } from '@/shared/icons'
import { useStudentTimeline } from '../../composables/use-student-timeline'
import StudentTimelineEntry from './StudentTimelineEntry.vue'
import StudentTimelineFilters from './StudentTimelineFilters.vue'

const props = defineProps<{
  studentId: number | null
  /** Changes whenever the card reloads (payment, transfer…) — refetch then. */
  refreshKey?: unknown
}>()

const { t } = useI18n()
const tl = useStudentTimeline(() => props.studentId)

onMounted(tl.load)
watch(() => [props.studentId, props.refreshKey], () => tl.load())
</script>
