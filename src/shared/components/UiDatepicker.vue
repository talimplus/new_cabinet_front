<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <VueDatePicker
      ref="picker"
      :uid="id"
      v-model="model"
      :dark="isDark"
      :enable-time-picker="enableTime"
      :range="range ? RANGE_CONFIG : false"
      :month-picker="monthPicker"
      :format="format"
      :placeholder="placeholder"
      :disabled="disabled"
      :clearable="clearable"
      :min-date="minDate"
      :max-date="maxDate"
      :auto-apply="!enableTime"
      :teleport="true"
      :state="errorMessage ? false : undefined"
      @blur="handleBlur"
    >
      <!-- Optional custom trigger (e.g. an icon button): replaces the input, click toggles the calendar. -->
      <template v-if="$slots.trigger" #trigger><slot name="trigger" /></template>
    </VueDatePicker>
  </UiFieldShell>
</template>

<script setup lang="ts">
import { ref, useId } from 'vue'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import { useTheme } from '@/shared/composables/use-theme'
import UiFieldShell from './UiFieldShell.vue'

// A date, a range tuple, or empty. Format to a string at submit time (dayjs).
type DateModel = Date | Date[] | null

interface Props extends FormControlProps<DateModel> {
  placeholder?: string
  hint?: string
  format?: string
  enableTime?: boolean
  range?: boolean
  monthPicker?: boolean
  required?: boolean
  disabled?: boolean
  clearable?: boolean
  /** Days before / after these are disabled in the calendar. */
  minDate?: Date
  maxDate?: Date
}

const props = withDefaults(defineProps<Props>(), {
  format: 'dd.MM.yyyy',
  clearable: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: DateModel] }>()

/**
 * A range is emitted only once BOTH ends are picked. The package default
 * (`partialRange: true`) auto-applies after the first click, so a parent that
 * reacts to the model re-renders the picker and the second click is lost.
 */
const RANGE_CONFIG = { partialRange: false }

const id = useId()
const { isDark } = useTheme()
const { model, errorMessage, handleBlur } = useFormControl<DateModel>(props, emit)

const picker = ref<{ openMenu: () => void } | null>(null)
/** Open the calendar from outside (e.g. a calendar icon button next to it). */
defineExpose({ open: () => picker.value?.openMenu() })
</script>

<style scoped>
/* Map vue-datepicker's CSS vars onto our tokens (light + dark handled here). */
:deep(.dp__theme_light),
:deep(.dp__theme_dark) {
  --dp-background-color: var(--surface);
  --dp-text-color: var(--foreground);
  --dp-border-color: var(--input);
  --dp-border-color-hover: var(--primary);
  --dp-primary-color: var(--primary);
  --dp-primary-text-color: var(--primary-foreground);
  --dp-hover-color: var(--surface-muted);
  --dp-menu-border-color: var(--border);
  --dp-border-radius: var(--radius-md);
  --dp-icon-color: var(--muted-foreground);
}
</style>
