<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <div class="relative">
      <input
        :id="id"
        type="text"
        inputmode="decimal"
        autocomplete="off"
        :value="text"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="cn(control, $slots.suffix && 'pr-14', errorMessage && invalid)"
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
import { ref, useId, watch } from 'vue'
import { cn } from '@/shared/utils/cn'
import { rewriteKeepingCaret } from '@/shared/utils/caret'
import { amountTextToValue, amountToText, cleanAmountText, groupAmountText } from '@/shared/utils/format-money'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import UiFieldShell from './UiFieldShell.vue'

/**
 * Amount field: groups thousands while typing (`100 000`, not `100000`) and
 * emits a plain number — '' when empty, exactly like `UiInput type="number"`,
 * so it drops into the same forms and zod schemas. Accepts a numeric string
 * from the backend (`"500000.00"`) as its value.
 */
type MoneyValue = number | string

interface Props extends FormControlProps<MoneyValue> {
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: MoneyValue] }>()

const id = useId()
const { model, errorMessage, handleBlur } = useFormControl<MoneyValue>(props, emit)

// Own text state: `100 000.` (a decimal point being typed) has no number form yet.
const text = ref(amountToText(model.value))
const asNumber = (v: MoneyValue | null | undefined) => (v === '' || v == null ? '' : Number(v))
watch(model, (value) => {
  if (amountTextToValue(cleanAmountText(text.value)) !== asNumber(value)) {
    text.value = amountToText(value)
  }
})

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const clean = cleanAmountText(el.value)
  text.value = groupAmountText(clean)
  rewriteKeepingCaret(el, text.value)
  model.value = amountTextToValue(clean)
}

const control =
  'w-full h-9 rounded-md border border-input bg-surface px-3 font-mono text-base md:text-sm text-foreground ' +
  'placeholder:text-fg-subtle transition-colors outline-none ' +
  'focus:border-primary focus:ring-2 focus:ring-primary/25 ' +
  'disabled:cursor-not-allowed disabled:opacity-50'
const invalid = 'border-danger focus:border-danger focus:ring-danger/30'
</script>
