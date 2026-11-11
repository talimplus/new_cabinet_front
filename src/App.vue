<script setup lang="ts">
import { UiToaster } from '@/shared/components'
import AppUpdatePrompt from '@/shared/components/layout/AppUpdatePrompt.vue'
import AppConfirmHost from '@/shared/components/layout/AppConfirmHost.vue'
</script>

<template>
  <UiToaster />
  <AppUpdatePrompt />
  <AppConfirmHost />
  <RouterView />
</template>
