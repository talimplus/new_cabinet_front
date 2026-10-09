<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <div :class="cn(shell, errorMessage && invalid, disabled && 'cursor-not-allowed opacity-50')">
      <span class="select-none pl-3 pr-1.5 font-mono text-muted-foreground">+998</span>
      <input
        :id="id"
        type="tel"
        inputmode="numeric"
        autocomplete="off"
        :value="display"
        :placeholder="placeholder ?? t('common.phonePlaceholder')"
        :disabled="disabled"
        class="h-full min-w-0 flex-1 bg-transparent pr-3 font-mono text-base text-foreground outline-none placeholder:text-fg-subtle disabled:cursor-not-allowed md:text-sm"
        @input="onInput"
        @blur="handleBlur"
      />
    </div>
  </UiFieldShell>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { cn } from '@/shared/utils/cn'
import { editablePhoneDigits, groupLocalDigits } from '@/shared/utils/format-phone'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import UiFieldShell from './UiFieldShell.vue'

/**
 * Uzbek phone field: a fixed `+998` prefix and the 9 local digits grouped as
 * `97 752 20 14`. Emits the stored form `+998977522014` ('' when cleared).
 * An old value in any spelling (`97-752-20-14`, `998…`) is read back as digits.
 */
interface Props extends FormControlProps<string> {
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const { t } = useI18n()
const id = useId()
const { model, errorMessage, handleBlur } = useFormControl<string>(props, emit)

const display = computed(() => groupLocalDigits(editablePhoneDigits(model.value)))

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const digits = editablePhoneDigits(el.value)
  model.value = digits ? `+998${digits}` : ''
  // Re-group in place: letters and over-long input never stay in the field.
  const grouped = groupLocalDigits(digits)
  if (el.value !== grouped) el.value = grouped
}

const shell =
  'flex h-9 w-full items-center rounded-md border border-input bg-surface transition-colors ' +
  'focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/25'
const invalid = 'border-danger focus-within:border-danger focus-within:ring-danger/30'
</script>
