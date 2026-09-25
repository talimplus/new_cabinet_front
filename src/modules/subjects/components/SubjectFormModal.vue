<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('subjects.editTitle') : t('subjects.createTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm :key="formKey" ref="formRef" :validation-schema="schema" :initial-values="initialValues" class="space-y-4" @submit="onSubmit">
      <UiInput name="name" :label="t('subjects.subjectName')" required />
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
import { UiModal, UiForm, UiInput, UiSelect, UiButton } from '@/shared/components'
import type { Subject } from '../interfaces/subject.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Subject | null
  defaultCenterId: number | null
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [values: GenericObject] }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)

const schema = computed(() =>
  toTypedSchema(
    z.object({
      name: z.string().min(1, t('subjects.nameRequired')),
      centerId: z.number({ message: t('common.centerRequired') }),
    }),
  ),
)
const initialValues = computed(() => ({
  name: props.editing?.name ?? '',
  centerId: props.editing?.center?.id ?? props.defaultCenterId ?? undefined,
}))
const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)

function onSubmit(values: GenericObject) {
  emit('submit', values)
}
defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
