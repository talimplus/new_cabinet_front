<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('leads.form.editTitle') : t('leads.form.createTitle')"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-4">
      <LeadContactFields :form="form" :errors="errors" />
      <LeadPreferenceFields :form="form" :errors="errors" :groups="groups" />
      <LeadPassportFields
        v-model:passport-series="form.passportSeries"
        v-model:passport-number="form.passportNumber"
        v-model:jshshir="form.jshshir"
      />
      <div class="grid gap-3 sm:grid-cols-2">
        <UiInput v-model="form.discountPercent" type="number" :label="t('leads.form.discountPercent')" :error="errors.discountPercent" />
        <UiInput v-model="form.discountReason" :label="t('leads.form.discountReason')" />
        <UiDatepicker v-model="form.followUpDate" :label="t('leads.form.followUpDate')" />
      </div>
      <UiTextarea v-model="form.comment" :label="t('leads.form.comment')" :rows="2" />
    </div>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton v-if="editing" variant="secondary" :loading="transferring" @click="onTransfer">
        {{ t('leads.transferToStudent') }}
      </UiButton>
      <UiButton :loading="loading" @click="onSave">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiDatepicker, UiTextarea, UiButton } from '@/shared/components'
import LeadContactFields from './LeadContactFields.vue'
import LeadPreferenceFields from './LeadPreferenceFields.vue'
import LeadPassportFields from './LeadPassportFields.vue'
import { useLeadForm } from '../composables/use-lead-form'
import type { Lead } from '../interfaces/lead.interface'
import type { LeadForm } from '../interfaces/lead-form.interface'
import type { LeadTransferForm } from '../interfaces/lead-transfer-form.interface'
import type { SelectOption } from '@/shared/interfaces/select-option.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Lead | null
  defaultCenterId: number | null
  loading?: boolean
  transferring?: boolean
}>()
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  submit: [payload: LeadForm]
  transfer: [payload: LeadTransferForm]
}>()

const { form, errors, groups, reset, validate, toPayload, toTransferPayload, setBackendErrors } =
  useLeadForm(() => props.defaultCenterId)

watch(() => props.modelValue, (open) => { if (open) reset(props.editing) })

function onSave() {
  if (validate()) emit('submit', toPayload())
}
function onTransfer() {
  if (validate()) emit('transfer', toTransferPayload())
}
defineExpose({ setBackendErrors })
</script>
