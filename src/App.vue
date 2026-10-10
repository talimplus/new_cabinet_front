<script setup lang="ts">
import { UiToaster } from '@/shared/components'
import AppUpdatePrompt from '@/shared/components/layout/AppUpdatePrompt.vue'
</script>

<template>
  <UiToaster />
  <AppUpdatePrompt />
  <RouterView />
</template>
