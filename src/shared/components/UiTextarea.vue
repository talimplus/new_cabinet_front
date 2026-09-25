<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <textarea
      :id="id"
      :value="model"
      :rows="rows"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="cn(control, errorMessage && invalid)"
      @input="model = ($event.target as HTMLTextAreaElement).value"
      @blur="handleBlur"
    />
  </UiFieldShell>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/shared/utils/cn'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import UiFieldShell from './UiFieldShell.vue'

interface Props extends FormControlProps<string> {
  placeholder?: string
  hint?: string
  rows?: number
  required?: boolean
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), { rows: 3 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const id = useId()
const { model, errorMessage, handleBlur } = useFormControl<string>(props, emit)

const control =
  'w-full rounded-md border border-input bg-surface px-3 py-2 text-base md:text-sm text-foreground ' +
  'placeholder:text-fg-subtle transition-colors outline-none resize-y ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'
const invalid = 'border-danger focus:border-danger focus:ring-danger/30'
</script>
