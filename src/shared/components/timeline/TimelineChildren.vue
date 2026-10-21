<template>
  <div class="mt-1">
    <button
      type="button"
      class="-ml-1 inline-flex h-11 items-center gap-1 rounded-md px-1 text-sm font-medium text-primary hover:underline md:h-7"
      :aria-expanded="open"
      @click="open = !open"
    >
      {{ t(open ? 'common.timeline.collapse' : 'common.timeline.expand', { count: entries.length }) }}
      <UiIcon :icon="open ? ChevronUp : ChevronDown" :size="14" />
    </button>

    <ul v-if="open" class="mt-1 space-y-1.5 border-l-2 border-border pl-3">
      <li v-for="child in entries" :key="child.id" class="break-words text-sm">
        <span class="font-medium text-foreground">
          <TimelineLinkText v-if="child.subject" :link="child.subject" />
          <span v-else>{{ child.title }}</span>
        </span>
        <template v-if="child.group">
          <span class="text-muted-foreground"> · </span>
          <TimelineLinkText :link="child.group" class="text-sm" />
        </template>
        <span v-for="(line, i) in child.lines" :key="i" class="text-muted-foreground"> · {{ line }}</span>
        <span v-if="child.note" class="text-muted-foreground"> — {{ child.note }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import UiIcon from '../UiIcon.vue'
import { ChevronDown, ChevronUp } from '@/shared/icons'
import TimelineLinkText from './TimelineLinkText.vue'
import type { TimelineEntryView } from '@/shared/interfaces/timeline-entry.interface'

defineProps<{ entries: TimelineEntryView[] }>()

const { t } = useI18n()
const open = ref(false)
</script>
