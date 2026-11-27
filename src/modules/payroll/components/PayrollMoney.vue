<template>
  <span v-if="!value" class="font-mono text-muted-foreground">—</span>
  <span v-else :class="cn('whitespace-nowrap font-mono', toneClass)">{{ sign }}{{ formatSom(Math.abs(value)) }}</span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/shared/utils/cn'
import { formatSom } from '@/shared/utils/format-money'

/**
 * One amount with its sign and colour: money taken off a salary is "−" in
 * warning/danger, money added is "+" in success. Zero renders a dash.
 */
interface Props {
  value: number | null | undefined
  tone?: 'plain' | 'minus' | 'plus' | 'strong'
}
const props = withDefaults(defineProps<Props>(), { tone: 'plain' })

const sign = computed(() => (props.tone === 'minus' ? '−' : props.tone === 'plus' ? '+' : ''))
const toneClass = computed(
  () =>
    ({
      plain: '',
      minus: 'text-warning',
      plus: 'text-success',
      strong: (props.value ?? 0) > 0 ? 'text-base font-bold text-danger' : 'font-semibold text-success',
    })[props.tone],
)
</script>
