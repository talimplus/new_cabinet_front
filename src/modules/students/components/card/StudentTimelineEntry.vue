<template>
  <li class="relative flex gap-3 pb-5 last:pb-0">
    <!-- Connector to the next marker; the last entry of a day has none. -->
    <span v-if="!last" class="absolute bottom-0 left-[17px] top-10 w-px bg-border" aria-hidden="true" />
    <span
      class="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
      :class="TIMELINE_TONE_MARKER[entry.tone]"
      aria-hidden="true"
    >
      <UiIcon :icon="entry.icon" :size="16" />
    </span>

    <div class="min-w-0 flex-1 pt-1.5">
      <div class="flex items-start justify-between gap-3">
        <p class="min-w-0 break-words text-sm font-semibold text-foreground">
          {{ entry.title }}
          <UiBadge v-if="entry.badge" :variant="entry.badge.variant" class="ml-1 align-middle">
            {{ entry.badge.text }}
          </UiBadge>
        </p>
        <span
          v-if="entry.amount"
          class="shrink-0 font-mono text-sm font-semibold"
          :class="TIMELINE_TONE_TEXT[entry.amount.tone]"
        >{{ entry.amount.text }}</span>
      </div>

      <p v-for="(line, i) in entry.lines" :key="i" class="mt-0.5 break-words text-sm text-muted-foreground">
        {{ line }}
      </p>

      <p
        v-if="entry.note"
        class="mt-2 whitespace-pre-line break-words rounded-md border-l-2 border-input bg-surface-muted px-3 py-1.5 text-sm text-foreground"
      >{{ entry.note }}</p>

      <p
        v-if="entry.time || entry.actor || entry.group"
        class="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-fg-subtle"
      >
        <span v-if="entry.time" class="font-mono">{{ entry.time }}</span>
        <span v-if="entry.actor" class="inline-flex items-center gap-1">
          <UiIcon :icon="User" :size="12" />{{ entry.actor }}
        </span>
        <span v-if="entry.group" class="rounded-sm bg-surface-muted px-1.5 py-0.5 text-muted-foreground">
          {{ entry.group }}
        </span>
      </p>
    </div>
  </li>
</template>

<script setup lang="ts">
import { UiBadge, UiIcon } from '@/shared/components'
import { User } from '@/shared/icons'
import { TIMELINE_TONE_MARKER, TIMELINE_TONE_TEXT } from '../../enums/timeline-tone.enum'
import type { TimelineEntryView } from '../../interfaces/student-timeline-entry.interface'

defineProps<{ entry: TimelineEntryView; last?: boolean }>()
</script>
