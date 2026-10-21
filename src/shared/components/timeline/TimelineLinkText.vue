<template>
  <RouterLink
    v-if="link.to"
    :to="link.to"
    class="text-primary underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
  >{{ link.text }}</RouterLink>
  <span v-else>{{ link.text }}</span>
</template>

<script setup lang="ts">
import type { TimelineLink } from '@/shared/interfaces/timeline-entry.interface'

defineProps<{ link: TimelineLink }>()
</script>
