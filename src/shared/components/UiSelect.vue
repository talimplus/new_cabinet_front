<template>
  <UiFieldShell :label="label" :hint="hint" :error="errorMessage" :required="required" :for-id="id">
    <Multiselect
      :id="id"
      v-model="model"
      :options="options"
      :mode="mode"
      :label="optionLabel"
      :value-prop="optionValue"
      :track-by="optionLabel"
      :searchable="searchable"
      :placeholder="placeholder"
      :can-clear="clearable"
      :close-on-select="mode === 'single'"
      :disabled="disabled"
      :no-options-text="t('common.noData')"
      :no-results-text="t('common.noData')"
      :class="cn('ui-multiselect', errorMessage && 'ui-multiselect--invalid')"
      @close="() => handleBlur()"
    />
  </UiFieldShell>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import Multiselect from '@vueform/multiselect'
import { cn } from '@/shared/utils/cn'
import { useFormControl, type FormControlProps } from '@/shared/composables/use-form-control'
import UiFieldShell from './UiFieldShell.vue'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

// Selection value: single primitive, an array (multiple/tags), or empty.
type SelectValue = string | number | Array<string | number> | null

interface Props extends FormControlProps<SelectValue> {
  options: SelectOption[]
  mode?: 'single' | 'multiple' | 'tags'
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  searchable?: boolean
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'single',
  optionLabel: 'label',
  optionValue: 'value',
  searchable: true,
  clearable: true,
})
const emit = defineEmits<{ 'update:modelValue': [value: SelectValue] }>()

const { t } = useI18n()
const id = useId()
const { model, errorMessage, handleBlur } = useFormControl<SelectValue>(props, emit)
</script>

<style scoped>
/* Bridge the multiselect package theme onto our design tokens. */
.ui-multiselect {
  --ms-bg: var(--surface);
  --ms-border-color: var(--input);
  --ms-border-color-active: var(--primary);
  --ms-radius: var(--radius-md);
  --ms-ring-color: var(--primary);
  --ms-ring-width: 2px;
  --ms-py: 0.4rem;
  --ms-option-bg-selected: var(--primary);
  --ms-option-bg-selected-pointed: var(--primary-hover);
  --ms-tag-bg: var(--primary-soft);
  --ms-tag-color: var(--primary);
  --ms-dropdown-bg: var(--surface);
  --ms-dropdown-border-color: var(--border);
  --ms-option-color-pointed: var(--foreground);
  --ms-empty-color: var(--muted-foreground);
  color: var(--foreground);
  /* iOS Safari zooms a focused field under 16px — keep 16px on phones. */
  --ms-font-size: 1rem;
}
@media (min-width: 768px) {
  .ui-multiselect {
    --ms-font-size: 0.875rem;
  }
}
.ui-multiselect--invalid {
  --ms-border-color: var(--danger);
  --ms-border-color-active: var(--danger);
  --ms-ring-color: var(--danger);
}
</style>
