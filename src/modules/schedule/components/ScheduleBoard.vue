<template>
  <div class="max-h-[70vh] overflow-auto rounded-lg border border-border bg-surface shadow-card">
    <div class="grid min-w-max" :style="{ gridTemplateColumns: `56px repeat(${columns.length}, minmax(150px, 1fr))` }">
      <!-- header row: corner + one room name per column -->
      <div class="sticky left-0 top-0 z-30 border-b border-border bg-surface-muted"></div>
      <div
        v-for="col in columns"
        :key="col.key"
        class="sticky top-0 z-20 truncate border-b border-l border-border bg-surface-muted px-2 py-2 text-center text-xs font-semibold text-foreground"
      >
        {{ col.name }}
      </div>

      <!-- time gutter (sticky while scrolling sideways) -->
      <div class="sticky left-0 z-10 bg-surface" :style="{ height: gridHeight + 'px' }">
        <span
          v-for="mark in hourMarks"
          :key="mark.top"
          class="absolute right-1.5 -translate-y-1/2 font-mono text-[10px] text-muted-foreground"
          :style="{ top: mark.top + 'px' }"
        >{{ mark.label }}</span>
      </div>

      <!-- one lane per room, lessons absolutely positioned by start/duration -->
      <div
        v-for="col in columns"
        :key="col.key"
        class="relative border-l border-border"
        :style="{ height: gridHeight + 'px' }"
      >
        <span
          v-for="mark in hourMarks"
          :key="mark.top"
          class="absolute inset-x-0 border-t border-dashed border-border/50"
          :style="{ top: mark.top + 'px' }"
        />
        <div
          v-for="p in col.items"
          :key="`${p.lesson.groupId}-${p.lesson.startTime}`"
          class="absolute overflow-hidden rounded-md border-l-2 px-1.5 py-1"
          :class="p.overlap ? 'border-danger bg-danger-soft text-danger' : 'border-primary bg-primary-soft text-foreground'"
          :style="blockStyle(p)"
        >
          <p class="font-mono text-[10px] leading-tight opacity-80">{{ p.lesson.startTime }}–{{ p.lesson.endTime }}</p>
          <p class="truncate text-[11px] font-semibold leading-tight">{{ p.lesson.groupName }}</p>
          <p v-if="p.lesson.teacherName" class="truncate text-[10px] leading-tight opacity-70">
            {{ p.lesson.teacherName }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { BoardColumn, PositionedLesson } from '../composables/use-schedule'

defineProps<{ columns: BoardColumn[]; gridHeight: number; hourMarks: Array<{ label: string; top: number }> }>()

function blockStyle(p: PositionedLesson): Record<string, string> {
  return {
    top: `${p.top}px`,
    height: `${p.height}px`,
    left: `calc(${(p.lane / p.lanes) * 100}% + 2px)`,
    width: `calc(${100 / p.lanes}% - 4px)`,
  }
}
</script>
