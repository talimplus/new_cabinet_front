<template>
  <label :class="cn('inline-flex items-start gap-2.5 select-none', disabled && 'opacity-50 cursor-not-allowed')">
    <span class="relative flex h-5 w-5 shrink-0 items-center justify-center">
      <input
        :id="id"
        type="checkbox"
        class="peer sr-only"
        :checked="model"
        :disabled="disabled"
        @change="model = ($event.target as HTMLInputElement).checked"
        @blur="handleBlur"
      />
      <span
        :class="cn(
          'h-5 w-5 rounded-[6px] border border-input bg-surface transition-colors',
          indeterminate && 'border-primary bg-primary',
        )"
        class="peer-checked:border-primary peer-checked:bg-primary
               peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40"
      />
      <Check
        v-show="model && !indeterminate"
        :size="14"
        class="pointer-events-none absolute text-primary-foreground"
        stroke-width="3"
      />
      <Minus
        v-show="indeterminate"
        :size="14"
        class="pointer-events-none absolute text-primary-foreground"
        stroke-width="3"
      />
    </span>
    <span v-if="label || $slots.default" class="text-sm text-foreground">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { Check, Minus } from '@/shared/icons'
import { cn } from '@/shared/utils/cn'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'

interface Props extends FormControlProps<boolean> {
  label?: string
  disabled?: boolean
  /**
   * Visual "some but not all" state for a parent checkbox. Purely presentational
   * — the bound value still reflects `checked`.
   */
  indeterminate?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const id = useId()
const { model, handleBlur } = useFormControl<boolean>(props, emit)
</script>
