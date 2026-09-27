<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('users.form.editTitle') : t('users.form.createEmployeeTitle')"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <UiForm :key="formKey" ref="formRef" :validation-schema="schema" :initial-values="initialValues" class="grid gap-3 sm:grid-cols-2" @submit="onSubmit">
      <UiInput name="firstName" :label="t('users.form.firstName')" required />
      <UiInput name="lastName" :label="t('users.form.lastName')" required />
      <UiInput name="login" :label="t('users.form.login')" required />
      <UiInput name="phone" type="tel" :label="t('users.form.phone')" required />
      <UiInput name="password" type="password" :label="t('users.form.password')" :required="!editing" :placeholder="editing ? t('users.form.passwordKeepHint') : ''" />
      <UiSelect name="roleId" :label="t('users.form.role')" :options="roleOptions" :searchable="false" :placeholder="t('users.form.selectRole')" />
      <UiInput name="salary" type="number" :label="t('users.form.salary')" />
      <UiInput name="commissionPercentage" type="number" :label="t('users.form.commissionPercentage')" />
      <p v-if="editing" class="rounded-md bg-info-soft px-3 py-2 text-xs text-info sm:col-span-2">{{ t('users.form.payChangeHint') }}</p>
    </UiForm>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="formRef?.submit()">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject } from 'vee-validate'
import { UiModal, UiForm, UiInput, UiSelect, UiButton } from '@/shared/components'
import { useUserForm } from '../composables/use-user-form'
import type { User } from '../interfaces/user.interface'
import type { UserForm } from '../interfaces/user-form.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: User | null
  defaultCenterId: number | null
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [payload: UserForm] }>()

const formRef = ref<{ submit: () => void; setBackendErrors: (e: unknown) => void } | null>(null)

const { roleOptions, loadRoles, schema, initialValues, buildPayload } = useUserForm(
  () => props.editing,
  () => props.defaultCenterId,
)
onMounted(loadRoles)

const formKey = computed(() => `${props.modelValue}-${props.editing?.id ?? 'new'}`)
function onSubmit(values: GenericObject) {
  emit('submit', buildPayload(values))
}
defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
