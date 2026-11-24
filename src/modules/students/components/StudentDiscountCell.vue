<template>
  <div v-if="periods.length" class="space-y-0.5">
    <div v-for="p in periods" :key="p.id" class="text-sm">
      <span class="font-mono">{{ formatDiscount(p.percent, p.amount) }}</span>
      <span
        v-if="p.reason"
        class="text-xs text-muted-foreground"
        :title="p.reason.length > MAX ? p.reason : undefined"
      >
        — {{ truncate(p.reason, MAX) }}</span
      >
    </div>
  </div>
  <div v-else-if="base.length" class="space-y-0.5">
    <div v-for="d in base" :key="d.groupId ?? 0" class="text-sm">
      <span class="font-mono">{{ formatDiscount(d.percent, d.amount) }}</span>
      <span v-if="d.groupName" class="text-xs text-muted-foreground"> · {{ d.groupName }}</span>
      <span v-if="d.reason" class="block text-xs text-muted-foreground" :title="d.reason.length > MAX ? d.reason : undefined">
        {{ truncate(d.reason, MAX) }}
      </span>
    </div>
  </div>
  <span v-else class="text-muted-foreground">—</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { truncate } from '@/shared/utils/truncate'
import { formatDiscount, permanentDiscounts } from '../utils/format-discount'
import type { Student } from '../interfaces/student.interface'

/** Reason longer than this is truncated inline; the full text stays in `title`. */
const MAX = 20

const props = defineProps<{ student: Student }>()
const periods = computed(() => props.student.discountPeriods ?? [])
/** Permanent discounts; `groupName` empty — all groups. */
const base = computed(() =>
  permanentDiscounts(props.student).map((d) => ({
    ...d,
    groupName: d.groupId == null ? '' : props.student.groups?.find((g) => g.id === d.groupId)?.name ?? `#${d.groupId}`,
  })),
)
</script>
