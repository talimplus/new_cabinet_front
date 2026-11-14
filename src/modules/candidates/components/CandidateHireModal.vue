<template>
  <UiModal :model-value="!!h.state.hireTarget" :title="t('candidates.hire.formTitle')" size="lg" @update:model-value="close">
    <p class="mb-4 rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('candidates.hire.formHint') }}</p>
    <UiForm
      :key="formKey" ref="formRef" :validation-schema="h.schema.value" :initial-values="h.initialValues.value"
      class="grid gap-3 sm:grid-cols-2" @submit="onSubmit"
    >
      <UiInput name="lastName" :label="t('users.form.lastName')" required />
      <UiInput name="firstName" :label="t('users.form.firstName')" required />
      <UiPhoneInput name="phone" :label="t('users.form.phone')" required />
      <UiSelect name="roleId" :label="t('users.form.role')" :options="h.roleOptions.value" :searchable="false" :placeholder="t('users.form.selectRole')" required />
      <UiInput name="login" :label="t('users.form.login')" required />
      <UiInput name="password" type="password" :label="t('users.form.password')" required />
      <UiMoneyInput name="salary" :label="t('users.form.salary')" />
      <UiInput name="commissionPercentage" type="number" :label="t('users.form.commissionPercentage')" />
    </UiForm>
    <template #footer>
      <UiButton variant="outline" :disabled="h.state.saving" @click="close">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="h.state.saving" @click="formRef?.submit()">{{ t('candidates.hire.submit') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiModal, UiForm, UiInput, UiPhoneInput, UiMoneyInput, UiSelect, UiButton } from '@/shared/components'
import type { useCandidateHire } from '../composables/use-candidate-hire'

const { t } = useI18n()
const props = defineProps<{ h: ReturnType<typeof useCandidateHire> }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)
// Re-mount when the roles arrive so the pre-picked role lands in the form.
const formKey = computed(() => `${props.h.state.hireTarget?.id ?? 0}-${props.h.roleOptions.value.length}`)

function close(): void {
  if (!props.h.state.saving) props.h.state.hireTarget = null
}
async function onSubmit(values: GenericObject): Promise<void> {
  try {
    await props.h.submitHire(values)
  } catch (e) {
    formRef.value?.setBackendErrors(e)
  }
}
</script>
