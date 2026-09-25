<template>
  <UiForm
    ref="formRef"
    :key="formKey"
    :validation-schema="schema"
    :initial-values="initialValues"
    class="space-y-5"
    @submit="(v) => emit('submit', v)"
  >
    <template #default="{ values }">
      <div class="grid gap-4 sm:grid-cols-2">
        <UiInput name="firstName" :label="t('profile.firstName')" required />
        <UiInput name="lastName" :label="t('profile.lastName')" required />
        <UiInput name="login" :label="t('profile.login')" required />
        <UiInput name="phone" type="tel" :label="t('common.phone')" required />
      </div>

      <div class="border-t border-border pt-5">
        <p class="mb-3 text-sm font-semibold text-foreground">{{ t('profile.changePassword') }}</p>
        <UiInput
          name="password"
          type="password"
          :label="t('profile.newPassword')"
          :hint="t('profile.passwordHint')"
        />
      </div>

      <div v-if="isTeacher" class="grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
        <UiInput :model-value="formatSom(salary)" :label="t('profile.salary')" readonly disabled />
        <UiInput :model-value="`${commissionPercentage ?? 0}%`" :label="t('profile.commissionPercentage')" readonly disabled />
      </div>

      <div class="flex flex-wrap justify-end gap-2 border-t border-border pt-5">
        <UiButton type="button" variant="outline" :disabled="loading || !isDirty(values)" @click="formRef?.resetForm()">
          {{ t('common.cancel') }}
        </UiButton>
        <UiButton type="button" :loading="loading" :disabled="!isDirty(values)" @click="formRef?.submit()">
          {{ t('common.save') }}
        </UiButton>
      </div>
    </template>
  </UiForm>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GenericObject, TypedSchema } from 'vee-validate'
import { UiForm, UiInput, UiButton } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'

const { t } = useI18n()

defineProps<{
  formKey: string
  schema: TypedSchema | Record<string, unknown>
  initialValues: GenericObject
  isTeacher: boolean
  salary: number | null
  commissionPercentage: number | null
  loading: boolean
  isDirty: (values: GenericObject) => boolean
}>()
const emit = defineEmits<{ submit: [values: GenericObject] }>()

const formRef = ref<{
  submit: () => void
  resetForm: () => void
  setBackendErrors: (e: unknown) => void
} | null>(null)

defineExpose({ setBackendErrors: (e: unknown) => formRef.value?.setBackendErrors(e) })
</script>
