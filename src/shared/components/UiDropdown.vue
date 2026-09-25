<template>
  <div ref="root" class="relative inline-block">
    <div @click="toggle">
      <slot name="trigger" :open="open" />
    </div>

    <Transition name="ui-dropdown">
      <div
        v-if="open"
        ref="panel"
        :class="
          cn(
            'absolute z-40 mt-1 min-w-44 max-w-[calc(100vw-2rem)] rounded-lg border border-border bg-surface-2 p-1 shadow-popover',
            flipped ? 'right-0' : alignClass,
          )
        "
        role="menu"
        @click="closeOnSelect && close()"
      >
        <slot :close="close" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, onMounted, onUnmounted } from 'vue'
import { cn } from '@/shared/utils/cn'

interface Props {
  align?: 'left' | 'right'
  closeOnSelect?: boolean
}

const props = withDefaults(defineProps<Props>(), { align: 'left', closeOnSelect: true })

const open = ref(false)
const root = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
/** Set when a left-aligned panel would run past the viewport (narrow screens). */
const flipped = ref(false)
const alignClass = props.align === 'right' ? 'right-0' : 'left-0'

async function toggle() {
  open.value = !open.value
  if (!open.value) return
  flipped.value = false
  await nextTick()
  const rect = panel.value?.getBoundingClientRect()
  if (rect && rect.right > window.innerWidth - 8) flipped.value = true
}
function close() {
  open.value = false
  flipped.value = false
}
function onDocClick(e: MouseEvent) {
  if (open.value && root.value && !root.value.contains(e.target as Node)) close()
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
