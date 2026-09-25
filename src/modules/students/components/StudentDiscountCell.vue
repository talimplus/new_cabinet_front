<template>
  <div v-if="periods.length" class="space-y-0.5">
    <div v-for="p in periods" :key="p.id" class="text-sm">
      <span class="font-mono">{{ p.percent }}%</span>
      <span
        v-if="p.reason"
        class="text-xs text-muted-foreground"
        :title="p.reason.length > MAX ? p.reason : undefined"
      >
        — {{ truncate(p.reason, MAX) }}</span
      >
    </div>
  </div>
  <div v-else-if="student.discountPercent">
    <span class="font-mono">{{ student.discountPercent }}%</span>
    <span
      v-if="student.discountReason"
      class="block text-xs text-muted-foreground"
      :title="student.discountReason.length > MAX ? student.discountReason : undefined"
    >
      {{ truncate(student.discountReason, MAX) }}
    </span>
  </div>
  <span v-else class="text-muted-foreground">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { truncate } from '@/shared/utils/truncate'
import type { Student } from '../interfaces/student.interface'

/** Reason longer than this is truncated inline; the full text stays in `title`. */
const MAX = 20

const props = defineProps<{ student: Student }>()
const periods = computed(() => props.student.discountPeriods ?? [])
</script>
