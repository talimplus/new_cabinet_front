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
      :hide-selected="false"
      :multiple-label="(picked: unknown) => selectedLabels(picked, options, optionLabel, optionValue)"
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
import { selectedLabels } from '@/shared/utils/selected-labels'
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

<style scoped src="./ui-select.css"></style>
