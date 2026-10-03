<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <div class="relative">
      <span v-if="$slots.prefix" class="absolute inset-y-0 left-3 flex items-center text-muted-foreground">
        <slot name="prefix" />
      </span>
      <input
        :id="id"
        :type="inputType"
        :value="model"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :class="cn(control, $slots.prefix && 'pl-9', ($slots.suffix || isPassword) && 'pr-9', errorMessage && invalid)"
        @input="onInput"
        @blur="handleBlur"
      />
      <button
        v-if="isPassword"
        type="button"
        :disabled="disabled"
        :aria-label="revealed ? t('common.hidePassword') : t('common.showPassword')"
        :aria-pressed="revealed"
        class="absolute inset-y-0 right-0 flex w-9 items-center justify-center rounded-r-md text-muted-foreground transition-colors hover:text-foreground focus-visible:text-foreground focus-visible:outline-none disabled:cursor-not-allowed"
        @click="revealed = !revealed"
      >
        <UiIcon :icon="revealed ? EyeOff : Eye" :size="16" />
      </button>
      <span v-else-if="$slots.suffix" class="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
        <slot name="suffix" />
      </span>
    </div>
  </UiFieldShell>
</template>

<script setup lang="ts">
import { computed, ref, useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { Eye, EyeOff } from '@/shared/icons'
import UiIcon from './UiIcon.vue'
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

const { t } = useI18n()
const id = useId()
// A password field carries its own eye toggle; it only swaps the input type.
const revealed = ref(false)
const isPassword = computed(() => props.type === 'password')
const inputType = computed(() => (isPassword.value && revealed.value ? 'text' : props.type))
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
