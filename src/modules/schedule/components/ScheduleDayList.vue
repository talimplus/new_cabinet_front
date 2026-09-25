<template>
  <div class="space-y-2">
    <div
      v-for="row in items"
      :key="`${row.p.lesson.groupId}-${row.p.lesson.startTime}`"
      class="rounded-lg border bg-surface p-3 shadow-card"
      :class="row.p.overlap ? 'border-danger' : 'border-border'"
    >
      <div class="flex items-center justify-between gap-2">
        <span class="font-mono text-sm text-foreground">
          {{ row.p.lesson.startTime }}–{{ row.p.lesson.endTime }}
        </span>
        <UiBadge v-if="row.p.overlap" variant="danger">{{ t('schedule.conflict.title') }}</UiBadge>
      </div>
      <p class="mt-1 font-semibold text-foreground">{{ row.p.lesson.groupName }}</p>
      <div class="mt-2 flex flex-wrap gap-2">
        <UiBadge variant="neutral">{{ row.room }}</UiBadge>
        <UiBadge v-if="row.p.lesson.teacherName" variant="neutral">{{ row.p.lesson.teacherName }}</UiBadge>
        <UiBadge v-if="row.p.lesson.subjectName" variant="neutral">{{ row.p.lesson.subjectName }}</UiBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge } from '@/shared/components'
import type { BoardColumn } from '../composables/use-schedule'

const { t } = useI18n()
const props = defineProps<{ columns: BoardColumn[] }>()

// Flatten every room lane into one time-sorted list (conflict flags preserved).
const items = computed(() =>
  props.columns
    .flatMap((col) => col.items.map((p) => ({ p, room: p.lesson.roomName ?? col.name })))
    .sort((a, b) => a.p.lesson.startTime.localeCompare(b.p.lesson.startTime)),
)
</script>
