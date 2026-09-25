<template>
  <UiModal
    :model-value="open"
    :title="t('students.view.modal.title')"
    size="md"
    :close-on-overlay="false"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <UiInput
        :model-value="amount ?? ''"
        type="number"
        :label="t('students.view.modal.amount')"
        :hint="`${t('students.view.stats.payableNow')}: ${formatSom(payableNow)}`"
        :error="error || undefined"
        :disabled="loading"
        placeholder="0"
        @update:model-value="emit('update:amount', $event === '' ? null : Number($event))"
      />

      <ReceptionFields
        v-model:method="method"
        v-model:paid-at="paidAt"
        v-model:comment="comment"
        :disabled="loading"
      />

      <PayDebtPreview :rows="allocation" />
    </div>

    <template #footer>
      <UiButton variant="ghost" :disabled="loading" @click="emit('close')">
        {{ t('common.cancel') }}
      </UiButton>
      <UiButton :loading="loading" :disabled="!valid" @click="emit('confirm')">
        {{ t('students.view.modal.pay') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiInput } from '@/shared/components'
import ReceptionFields from '@/shared/components/receipt/ReceptionFields.vue'
import { formatSom } from '@/shared/utils/format-money'
import PayDebtPreview from './PayDebtPreview.vue'
import type { PaymentMethod } from '@/shared/enums/payment-method.enum'
import type { DebtAllocation } from '../../interfaces/pay-debt.interface'

const { t } = useI18n()

defineProps<{
  open: boolean
  amount: number | null
  payableNow: number
  allocation: DebtAllocation[]
  error?: string
  valid?: boolean
  loading?: boolean
}>()
const emit = defineEmits<{
  close: []
  confirm: []
  'update:amount': [value: number | null]
}>()

// The reception fields keep their own state in `usePayDebt`; the modal only
// bridges it so the parent stays thin.
const method = defineModel<PaymentMethod>('method', { required: true })
const paidAt = defineModel<Date | null>('paidAt', { required: true })
const comment = defineModel<string>('comment', { required: true })
</script>
