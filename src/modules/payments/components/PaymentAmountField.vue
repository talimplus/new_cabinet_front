<template>
  <UiInput
    :model-value="modelValue ?? ''"
    type="number"
    :label="t('payments.dialog.amountLabel')"
    :hint="hint"
    :error="error"
    :disabled="disabled || locked"
    placeholder="0"
    @update:model-value="emit('update:modelValue', $event === '' ? null : Number($event))"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiInput } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'

const { t } = useI18n()

const props = defineProps<{
  modelValue: number | null
  /** Ceiling shown in the hint — what is still collectable from the student. */
  payable: number
  /** A recalculation has filled the amount; it must not be hand-edited. */
  locked?: boolean
  error?: string
  disabled?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const hint = computed(() =>
  props.locked
    ? t('payments.dialog.calcHint')
    : `${t('payments.table.remaining')}: ${formatSom(props.payable)}`,
)
</script>
