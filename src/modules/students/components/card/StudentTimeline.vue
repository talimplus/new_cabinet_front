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
      <TimelineDays
        :days="tl.days.value"
        :has-items="tl.items.value.length > 0"
        :loading="tl.loading.value"
        :failed="tl.failed.value"
        :remaining="tl.remaining.value"
        :empty-text="t('students.timeline.empty')"
        :empty-filtered-text="t('students.timeline.emptyFiltered')"
        @retry="tl.load"
        @show-more="tl.showMore"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { History } from '@/shared/icons'
import { useStudentTimeline } from '../../composables/use-student-timeline'
import TimelineDays from '@/shared/components/timeline/TimelineDays.vue'
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
