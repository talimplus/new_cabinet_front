<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('syllabuses.editTitle') : t('syllabuses.addTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm
      :key="formKey"
      ref="formRef"
      :validation-schema="schema"
      :initial-values="initialValues"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UiInput name="name" :label="t('syllabuses.form.name')" required />
      <UiSelect name="subjectId" :label="t('syllabuses.form.subject')" :options="subjects" :placeholder="t('syllabuses.selectSubject')" />
      <UiTextarea name="description" :label="t('syllabuses.form.description')" :rows="3" />
    </UiForm>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="saving" @click="formRef?.submit()">{{ t('common.save') }}</UiButton>
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
import { createSyllabus, updateSyllabus } from '../api/syllabuses.api'
import { useNotificationStore } from '@/stores/notification.store'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'
import type { Syllabus } from '../interfaces/syllabus.interface'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean; subjects: SelectOption[]; editing?: Syllabus | null }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()

const notify = useNotificationStore()
const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)

const schema = computed(() =>
  toTypedSchema(
    z.object({
      name: z.string().min(1, t('syllabuses.validation.name')),
      subjectId: z.number({ message: t('syllabuses.subjectRequired') }),
      description: z.string().optional(),
    }),
  ),
)
const initialValues = computed(() => ({
  name: props.editing?.name ?? '',
  subjectId: props.editing?.subject.id,
  description: props.editing?.description ?? '',
}))
const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)

async function onSubmit(values: GenericObject) {
  saving.value = true
  const description = (values.description as string) ?? ''
  const base = { name: values.name as string, subjectId: values.subjectId as number }
  try {
    // An edit sends '' so a cleared description is actually cleared on the server.
    if (props.editing) await updateSyllabus(props.editing.id, { ...base, description })
    else await createSyllabus({ ...base, description: description || undefined })
    notify.success(t('common.saved'))
    emit('update:modelValue', false)
    emit('saved')
  } catch (error) {
    formRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
</script>
