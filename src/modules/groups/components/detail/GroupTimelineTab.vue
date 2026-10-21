<template>
  <section class="rounded-lg border border-border bg-surface shadow-card">
    <header class="space-y-3 border-b border-border p-4">
      <div>
        <h3 class="flex items-center gap-2 text-base font-semibold text-foreground">
          <UiIcon :icon="History" :size="18" class="text-primary" />
          {{ t('groups.tabs.timeline') }}
        </h3>
        <p class="mt-0.5 text-sm text-muted-foreground">{{ t('groups.timeline.subtitle') }}</p>
      </div>
      <GroupTimelineFilters
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
        :empty-text="t('groups.timeline.empty')"
        :empty-filtered-text="t('groups.timeline.emptyFiltered')"
        @retry="tl.load"
        @show-more="tl.showMore"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiIcon } from '@/shared/components'
import { History } from '@/shared/icons'
import TimelineDays from '@/shared/components/timeline/TimelineDays.vue'
import { useGroupTimeline } from '../../composables/use-group-timeline'
import GroupTimelineFilters from './GroupTimelineFilters.vue'

const props = defineProps<{ groupId: number }>()

const { t } = useI18n()
const tl = useGroupTimeline(() => props.groupId)

onMounted(tl.load)
</script>
