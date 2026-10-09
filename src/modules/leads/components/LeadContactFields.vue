<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <UiInput v-model="form.firstName" :label="t('leads.form.firstName')" :error="errors.firstName" />
    <UiInput v-model="form.lastName" :label="t('leads.form.lastName')" :error="errors.lastName" />
    <UiPhoneInput v-model="form.phone" :label="t('leads.form.phone')" :error="errors.phone" required />
    <UiPhoneInput v-model="form.secondPhone" :label="t('leads.form.secondPhone')" :error="errors.secondPhone" />
    <UiDatepicker v-model="form.birthDate" :label="t('leads.form.birthDate')" :error="errors.birthDate" />
    <UiInput v-model="form.monthlyFee" type="number" :label="t('leads.form.monthlyFee')" :error="errors.monthlyFee" />
  </div>
</template>

<script setup lang="ts">
import { UiInput, UiDatepicker, UiPhoneInput } from '@/shared/components'
import type { LeadFormState } from '../composables/use-lead-form'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ form: LeadFormState; errors: Record<string, string> }>()
</script>
