<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('centers.dialog.editTitle') : t('centers.dialog.createTitle')"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm :key="formKey" ref="formRef" :validation-schema="schema" :initial-values="initialValues" class="space-y-4" @submit="onSubmit">
      <UiInput name="name" :label="t('centers.form.centerName')" required />
      <UiCheckbox name="isDefault" :label="t('centers.form.defaultCenter')" />

      <!-- Attendance geofence needs the center id (to capture the IP) → edit only. -->
      <CenterAttendanceFields
        v-if="editing"
        v-model:latitude="att.form.latitude"
        v-model:longitude="att.form.longitude"
        v-model:check-in-radius-meters="att.form.checkInRadiusMeters"
        v-model:public-ip="att.form.publicIp"
        :geo-loading="att.geoLoading.value"
        :ip-loading="att.ipLoading.value"
        @use-location="att.useCurrentPosition"
        @capture-ip="onCaptureIp"
      />
    </UiForm>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="formRef?.submit()">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { z } from 'zod'
import { toTypedSchema } from '@vee-validate/zod'
import type { GenericObject } from 'vee-validate'
import { UiModal, UiForm, UiInput, UiCheckbox, UiButton } from '@/shared/components'
import CenterAttendanceFields from './CenterAttendanceFields.vue'
import { useCenterAttendance } from '../composables/use-center-attendance'
import type { Center } from '../interfaces/center.interface'
import type { CenterForm } from '../interfaces/center-form.interface'

const { t } = useI18n()

const props = defineProps<{ modelValue: boolean; editing: Center | null; loading?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [payload: CenterForm] }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)
const att = useCenterAttendance()

const schema = computed(() =>
  toTypedSchema(z.object({ name: z.string().min(1, t('centers.nameRequired')), isDefault: z.boolean().optional() })),
)
const initialValues = computed(() => ({
  name: props.editing?.name ?? '',
  isDefault: props.editing?.isDefault ?? false,
}))
const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)

watch(
  () => props.modelValue,
  (open) => {
    if (open) att.applyFrom(props.editing)
  },
)

function onCaptureIp() {
  if (props.editing) att.captureIp(props.editing.id)
}

function onSubmit(values: GenericObject) {
  const payload: CenterForm = { name: values.name as string, isDefault: values.isDefault as boolean }
  if (props.editing) Object.assign(payload, att.toPayload())
  emit('submit', payload)
}
defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
