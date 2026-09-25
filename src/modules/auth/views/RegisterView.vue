<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiForm, UiInput, UiButton } from '@/shared/components'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/use-auth'

const { t } = useI18n()
const { loading, formRef, registerSchema, submitRegister } = useAuth()

const initialValues = {
  organizationName: '', centerName: '', firstName: '', lastName: '', phone: '', email: '', password: '',
}
</script>

<template>
  <AuthShell :title="t('auth.registerHeading')" :subtitle="t('auth.registerTagline')">
    <UiForm
      ref="formRef"
      :validation-schema="registerSchema"
      :initial-values="initialValues"
      class="space-y-3.5"
      @submit="submitRegister"
    >
      <UiInput name="organizationName" :label="t('auth.organizationName')" required />
      <UiInput name="centerName" :label="t('auth.centerName')" required />
      <div class="grid grid-cols-2 gap-3">
        <UiInput name="firstName" :label="t('auth.firstName')" required />
        <UiInput name="lastName" :label="t('auth.lastName')" required />
      </div>
      <UiInput name="phone" type="tel" :label="t('auth.phone')" placeholder="+998901234567" required />
      <UiInput name="email" type="email" :label="t('auth.email')" placeholder="mail@example.com" required />
      <UiInput name="password" type="password" :label="t('auth.password')" placeholder="••••••••" required />
      <UiButton type="submit" :loading="loading" block>{{ t('auth.registerHeading') }}</UiButton>
    </UiForm>

    <template #footer>
      {{ t('auth.alreadyHaveAccount') }}
      <RouterLink to="/login" class="font-medium text-primary hover:underline">{{ t('auth.logIn') }}</RouterLink>
    </template>
  </AuthShell>
</template>
