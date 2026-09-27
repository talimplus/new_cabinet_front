<template>
  <!--
    Shown over `UiTable` while a refetch runs with rows already on screen
    (filter, page change): the old rows dim and stop taking clicks, so the
    swap to new data is never silent. The first load keeps its own spinner.
  -->
  <Transition
    enter-active-class="transition-opacity duration-150"
    leave-active-class="transition-opacity duration-150"
    enter-from-class="opacity-0"
    leave-to-class="opacity-0"
  >
    <div
      v-if="active"
      data-test="table-refresh"
      class="absolute inset-0 z-10 cursor-progress rounded-lg bg-surface/60"
    >
      <div class="sticky top-[40vh] flex justify-center py-6">
        <span
          class="flex size-10 items-center justify-center rounded-full border border-border bg-surface-2 text-primary shadow-popover"
        >
          <UiSpinner :size="20" />
        </span>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import UiSpinner from './UiSpinner.vue'

interface Props {
  active: boolean
}

defineProps<Props>()
</script>
