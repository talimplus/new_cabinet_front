<template>
  <div ref="root" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" :open="open" />
    </div>

    <!-- In <body>: inside a table the panel was clipped by its overflow box. -->
    <Teleport to="body">
      <Transition name="ui-dropdown">
        <div
          v-if="open"
          ref="panel"
          class="fixed z-[55] min-w-44 max-w-[calc(100vw-1rem)] rounded-lg border border-border bg-surface-2 p-1 shadow-popover"
          :style="{ top: `${position.top}px`, left: `${position.left}px`, visibility: placed ? undefined : 'hidden' }"
          role="menu"
          @click="closeOnSelect && close()"
        >
          <slot :close="close" />
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted } from 'vue'
import { useFloatingPanel } from '@/shared/composables/use-floating-panel'

interface Props {
  align?: 'left' | 'right'
  closeOnSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), { align: 'left', closeOnSelect: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
// Placed under the trigger, flipped above / inward when the viewport has no room.
const floating = useFloatingPanel(root, panel, () => props.align)
const { position, placed } = floating

async function toggle() {
  if (open.value) return close()
  open.value = true
  await nextTick()
  floating.update()
  floating.start()
}
function close() {
  open.value = false
  floating.stop()
}
function onDocClick(e: MouseEvent) {
  const target = e.target as Node
  if (!open.value || root.value?.contains(target) || panel.value?.contains(target)) return
  close()
}
function onEsc(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onEsc)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onEsc)
})

defineExpose({ close })
</script>

<style scoped>
.ui-dropdown-enter-active,
.ui-dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.ui-dropdown-enter-from,
.ui-dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
