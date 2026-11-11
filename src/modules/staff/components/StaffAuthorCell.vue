<template>
  <div>
    <div>{{ author ? `${author.firstName} ${author.lastName}` : '—' }}</div>
    <div class="font-mono text-xs text-muted-foreground">{{ formatDate(createdAt) }}</div>
  </div>
</template>

<script setup lang="ts">
import { formatDate } from '@/shared/utils/format-date'

/** "Who wrote it, when" — shared by the advances and bonuses lists. */
defineProps<{
  author: { firstName: string; lastName: string } | null
  createdAt: string
}>()
</script>
