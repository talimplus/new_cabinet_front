<template>
  <component :is="icon" :size="size" :stroke-width="strokeWidth" />
</template>

<script setup lang="ts">
import type { Component } from 'vue'

/**
 * Standardizes icon size/stroke. Pass an icon imported from `@/shared/icons`:
 *   <UiIcon :icon="Search" />
 * Never import icons from the package directly in features.
 */
interface Props {
  icon: Component
  size?: number
  strokeWidth?: number
}

withDefaults(defineProps<Props>(), { size: 18, strokeWidth: 2 })
</script>
