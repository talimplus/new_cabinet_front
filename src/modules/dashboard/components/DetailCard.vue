<template>
  <div class="rounded-lg border border-border bg-surface p-5 shadow-card">
    <h3 class="text-sm font-semibold text-foreground">{{ title }}</h3>
    <div class="mt-4 space-y-4">
      <div v-for="row in rows" :key="row.label">
        <div class="flex items-center justify-between gap-2 text-sm">
          <span class="text-muted-foreground">{{ row.label }}</span>
          <span :class="cn('font-mono font-medium', toneCls[row.tone ?? 'default'])">{{ row.value }}</span>
        </div>
        <div v-if="row.percent !== undefined" class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-muted">
          <div class="h-full rounded-full bg-primary" :style="{ width: `${clamp(row.percent)}%` }" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '@/shared/utils/cn'

interface DetailRow {
  label: string
  value: string
  tone?: 'default' | 'success' | 'danger'
  percent?: number
}

defineProps<{ title: string; rows: DetailRow[] }>()

const toneCls: Record<'default' | 'success' | 'danger', string> = {
  default: 'text-foreground',
  success: 'text-success',
  danger: 'text-danger',
}

function clamp(n: number): number {
  return Math.min(100, Math.max(0, n))
}
</script>
