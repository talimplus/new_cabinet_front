<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('expenses.editTitle') : t('expenses.createTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm :key="formKey" ref="formRef" :validation-schema="schema" :initial-values="initialValues" class="space-y-4" @submit="onSubmit">
      <UiInput name="name" :label="t('expenses.name')" required />
      <UiInput name="amount" type="number" :label="t('expenses.amount')" required>
        <template #suffix>{{ t('common.sum') }}</template>
      </UiInput>
      <UiSelect name="forMonth" :label="t('expenses.month')" :options="monthChoices" :searchable="false" :placeholder="t('expenses.selectMonth')" />
      <UiTextarea name="description" :label="t('expenses.description')" :rows="3" />
    </UiForm>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="formRef?.submit()">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { UiModal, UiForm, UiInput, UiSelect, UiTextarea, UiButton } from '@/shared/components'
import { monthOptions, currentMonth } from '../utils/month'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { Expense } from '../interfaces/expense.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Expense | null
  defaultCenterId: number | null
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [values: GenericObject] }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)

const schema = computed(() =>
  toTypedSchema(
    z.object({
      centerId: z.number({ message: t('common.centerRequired') }),
      name: z.string().min(1, t('expenses.validation.name')),
      amount: z
        .number({ message: t('expenses.validation.amount') })
        .positive(t('expenses.validation.amountPositive')),
      forMonth: z.string().min(1, t('expenses.validation.month')),
      description: z.string().optional(),
    }),
  ),
)

/** Keep the edited expense's own month selectable even if it predates the range. */
const monthChoices = computed<SelectOption[]>(() => {
  const opts = monthOptions()
  const em = props.editing?.forMonth?.slice(0, 7)
  if (em && !opts.some((o) => o.value === em)) opts.unshift({ label: em, value: em })
  return opts
})

const initialValues = computed(() => ({
  centerId: props.editing?.centerId ?? props.defaultCenterId ?? undefined,
  name: props.editing?.name ?? '',
  amount: props.editing?.amount != null ? Number(props.editing.amount) : undefined,
  forMonth: props.editing?.forMonth?.slice(0, 7) ?? currentMonth(),
  description: props.editing?.description ?? '',
}))
const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)

function onSubmit(values: GenericObject) {
  emit('submit', values)
}
defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
