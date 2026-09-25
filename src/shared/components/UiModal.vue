<template>
  <Teleport to="body">
    <Transition name="ui-modal">
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-overlay backdrop-blur-sm" @click="onOverlay" />
        <div
          role="dialog"
          aria-modal="true"
          :class="cn('relative w-full rounded-xl bg-surface-2 shadow-popover', sizes[size])"
        >
          <header v-if="title || $slots.header" class="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
            <slot name="header"><h2 class="text-base font-semibold text-foreground">{{ title }}</h2></slot>
            <button v-if="closable" class="rounded-md p-1 text-muted-foreground hover:bg-surface-muted" @click="close">
              <X :size="18" />
            </button>
          </header>

          <div class="max-h-[70vh] overflow-y-auto px-5 py-4"><slot /></div>

          <footer v-if="$slots.footer" class="flex justify-end gap-2 border-t border-border px-5 py-4">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { watch, onMounted, onUnmounted } from 'vue'
import { X } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'

interface Props {
  modelValue: boolean
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closable?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  closable: true,
  closeOnOverlay: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const sizes: Record<NonNullable<Props['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
}

function close() {
  emit('update:modelValue', false)
}
function onOverlay() {
  if (props.closeOnOverlay) close()
}

// Lock body scroll while open.
watch(
  () => props.modelValue,
  (open) => {
    if (typeof document !== 'undefined') document.body.style.overflow = open ? 'hidden' : ''
  },
)
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue && props.closable) close()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (typeof document !== 'undefined') document.body.style.overflow = ''
})
</script>

<style scoped>
.ui-modal-enter-active,
.ui-modal-leave-active {
  transition: opacity 0.2s ease;
}
.ui-modal-enter-from,
.ui-modal-leave-to {
  opacity: 0;
}
</style>
