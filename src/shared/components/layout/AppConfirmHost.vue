<template>
  <UiConfirmDialog
    :model-value="confirm.state.open"
    :title="confirm.state.title"
    :message="confirm.state.message"
    :confirm-label="confirm.state.confirmLabel"
    :variant="confirm.state.variant"
    @confirm="confirm.accept"
    @cancel="confirm.cancel"
  />
</template>

<script setup lang="ts">
import UiConfirmDialog from '../UiConfirmDialog.vue'
import { useConfirmStore } from '@/stores/confirm.store'

/** Renders the app-wide confirm dialog that `useConfirmStore().ask()` opens. */
const confirm = useConfirmStore()
</script>
