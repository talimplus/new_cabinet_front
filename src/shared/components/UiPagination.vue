<template>
  <nav v-if="totalPages > 1" class="flex items-center justify-center gap-1" aria-label="Pagination">
    <button :class="btn" :disabled="page <= 1" @click="go(page - 1)">
      <UiIcon :icon="ChevronLeft" :size="16" />
    </button>

    <button
      v-for="(p, i) in pages"
      :key="i"
      :disabled="p === '…'"
      :class="cn(btn, p === page && 'border-primary bg-primary-soft text-on-primary-soft', p === '…' && 'pointer-events-none')"
      @click="typeof p === 'number' && go(p)"
    >
      {{ p }}
    </button>

    <button :class="btn" :disabled="page >= totalPages" @click="go(page + 1)">
      <UiIcon :icon="ChevronRight" :size="16" />
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import UiIcon from './UiIcon.vue'
import { ChevronLeft, ChevronRight } from '@/shared/icons'

interface Props {
  page: number
  totalPages: number
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:page': [value: number] }>()

const btn =
  'inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-input bg-surface px-2 text-sm text-foreground transition-colors hover:bg-surface-muted disabled:pointer-events-none disabled:opacity-40'

/** Windowed page list: 1 … (p-1) p (p+1) … last. */
const pages = computed<Array<number | '…'>>(() => {
  const total = props.totalPages
  const cur = props.page
  const out: Array<number | '…'> = []
  const push = (n: number) => out.push(n)
  const window = new Set([1, total, cur, cur - 1, cur + 1])
  let last = 0
  for (let n = 1; n <= total; n++) {
    if (!window.has(n)) continue
    if (n - last > 1) out.push('…')
    push(n)
    last = n
  }
  return out
})

function go(p: number) {
  if (p >= 1 && p <= props.totalPages && p !== props.page) emit('update:page', p)
}
</script>
