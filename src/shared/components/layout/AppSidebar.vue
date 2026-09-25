<template>
  <!-- Desktop: fixed rail -->
  <aside class="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-surface lg:block">
    <SidebarNav />
  </aside>

  <!-- Mobile: off-canvas drawer -->
  <Teleport to="body">
    <Transition name="drawer">
      <div v-if="open" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-overlay backdrop-blur-sm" @click="emit('close')" />
        <aside class="absolute inset-y-0 left-0 w-72 max-w-[80vw] border-r border-border bg-surface">
          <SidebarNav @navigate="emit('close')" />
        </aside>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onUnmounted } from 'vue'
import SidebarNav from './SidebarNav.vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()

// Lock background scroll while the mobile drawer is open.
watch(
  () => props.open,
  (open) => {
    if (typeof document !== 'undefined') document.body.style.overflow = open ? 'hidden' : ''
  },
)
onUnmounted(() => {
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.drawer-enter-active,
.drawer-leave-active {
  transition: opacity 0.2s ease;
}
.drawer-enter-active aside,
.drawer-leave-active aside {
  transition: transform 0.2s ease;
}
.drawer-enter-from,
.drawer-leave-to {
  opacity: 0;
}
.drawer-enter-from aside,
.drawer-leave-to aside {
  transform: translateX(-100%);
}
</style>
