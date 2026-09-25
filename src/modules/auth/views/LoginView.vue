<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiForm, UiInput, UiButton } from '@/shared/components'
import AuthShell from '../components/AuthShell.vue'
import { useAuth } from '../composables/use-auth'

const { t } = useI18n()
const { loading, formRef, loginSchema, submitLogin } = useAuth()
</script>

<template>
  <AuthShell :title="t('auth.loginTitle')" :subtitle="t('auth.loginSubtitle')">
    <UiForm
      ref="formRef"
      :validation-schema="loginSchema"
      :initial-values="{ email: '', password: '' }"
      class="space-y-4"
      @submit="submitLogin"
    >
      <UiInput name="email" type="email" :label="t('auth.email')" placeholder="mail@example.com" required />
      <UiInput name="password" type="password" :label="t('auth.password')" placeholder="••••••••" required />
      <UiButton type="submit" :loading="loading" block>{{ t('auth.login') }}</UiButton>
    </UiForm>

    <template #footer>
      {{ t('auth.noAccount') }}
      <RouterLink to="/register" class="font-medium text-primary hover:underline">
        {{ t('auth.signUp') }}
      </RouterLink>
    </template>
  </AuthShell>
</template>
