<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('candidates.editTitle') : t('candidates.createTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm :key="formKey" ref="formRef" :validation-schema="schema" :initial-values="initialValues" class="space-y-4" @submit="emit('submit', $event)">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput name="lastName" :label="t('candidates.form.lastName')" required />
        <UiInput name="firstName" :label="t('candidates.form.firstName')" required />
        <UiPhoneInput name="phone" :label="t('candidates.form.phone')" required />
        <UiInput name="birthYear" type="number" :label="t('candidates.form.birthYear')" :placeholder="t('candidates.form.birthYearPlaceholder')" required />
      </div>
      <UiTextarea name="experience" :label="t('candidates.form.experience')" :placeholder="t('candidates.form.experiencePlaceholder')" :rows="2" required />
      <UiSelect name="subjectId" :label="t('candidates.form.subject')" :options="subjects" :placeholder="t('candidates.form.subjectPlaceholder')" clearable />
      <UiInput name="address" :label="t('candidates.form.address')" />
      <UiTextarea name="comment" :label="t('candidates.form.comment')" :rows="2" />
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
import type { GenericObject } from 'vee-validate'
import { UiModal, UiForm, UiInput, UiPhoneInput, UiSelect, UiTextarea, UiButton } from '@/shared/components'
import { useCandidateSchema } from '../composables/use-candidate-schema'
import type { Candidate } from '../interfaces/candidate.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Candidate | null
  defaultCenterId: number | null
  subjects: SelectOption[]
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [values: GenericObject] }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)
const schema = useCandidateSchema()

const initialValues = computed(() => {
  const c = props.editing
  return {
    centerId: c?.centerId ?? props.defaultCenterId ?? undefined,
    lastName: c?.lastName ?? '',
    firstName: c?.firstName ?? '',
    phone: c?.phone ?? '',
    birthYear: c?.birthYear ?? undefined,
    experience: c?.experience ?? '',
    subjectId: c?.subjectId ?? null,
    address: c?.address ?? '',
    comment: c?.comment ?? '',
  }
})
const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)

defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
