<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <div class="relative">
      <span v-if="$slots.prefix" class="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        <slot name="prefix" />
      </span>
      <input
        :id="id"
        :type="type"
        :value="model"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="cn(control, $slots.prefix && 'pl-9', $slots.suffix && 'pr-9', errorMessage && invalid)"
        @input="onInput"
        @blur="handleBlur"
      />
      <span v-if="$slots.suffix" class="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        <slot name="suffix" />
      </span>
    </div>
  </UiFieldShell>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/shared/utils/cn'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import UiFieldShell from './UiFieldShell.vue'

interface Props extends FormControlProps<string | number> {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'search' | 'url' | 'month' | 'date' | 'time'
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  /** Shown but not editable — e.g. a generated link the user only copies. */
  readonly?: boolean
}

const props = withDefaults(defineProps<Props>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [value: string | number] }>()

const id = useId()
const { model, errorMessage, handleBlur } = useFormControl<string | number>(props, emit)

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  if (props.type === 'number') {
    // A cleared number field yields NaN — emit '' so the model stays clean.
    model.value = el.value === '' ? '' : el.valueAsNumber
  } else {
    model.value = el.value
  }
}

const control =
  'w-full h-9 rounded-md border border-input bg-surface px-3 text-base md:text-sm text-foreground ' +
  'placeholder:text-fg-subtle transition-colors outline-none ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'
const invalid = 'border-danger focus:border-danger focus:ring-danger/30'
</script>
