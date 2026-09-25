<template>
  <UiModal
    :model-value="open"
    :title="t('payments.dialog.partialTitle')"
    size="md"
    :close-on-overlay="false"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <PaymentSummaryBlock :payment="payment" :payable="payable" with-student with-full-amount />

      <!-- Keyed so a write-off typed for one row never rides along with the next. -->
      <PaymentExclusionCard
        v-if="canExcludeLessons"
        :key="`excl-partial-${payment?.id}`"
        :payment="payment"
        :disabled="loading"
        @change="setExclusion"
      />

      <PaymentCalcSection
        :date="date"
        :calculation="calculation"
        :calculating="calculating"
        :disabled="loading"
        @calculate="emit('calculate', $event)"
        @clear="onClearDate"
      />

      <ReceptionFields
        v-model:method="method"
        v-model:paid-at="paidAt"
        v-model:comment="comment"
        :disabled="loading"
      />

      <PaymentAmountField
        v-model="amount"
        :payable="payable"
        :locked="!!calculation"
        :error="error"
        :disabled="loading"
      />
    </div>

    <template #footer>
      <PaymentDialogFooter
        :loading="loading"
        :disabled="!valid"
        @cancel="emit('close')"
        @confirm="submit"
      />
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiModal } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useReceptionForm } from '@/shared/composables/use-reception-form'
import { usePartialAmount } from '../composables/use-partial-amount'
import PaymentSummaryBlock from './PaymentSummaryBlock.vue'
import PaymentExclusionCard from './PaymentExclusionCard.vue'
import PaymentCalcSection from './PaymentCalcSection.vue'
import ReceptionFields from '@/shared/components/receipt/ReceptionFields.vue'
import PaymentAmountField from './PaymentAmountField.vue'
import PaymentDialogFooter from './PaymentDialogFooter.vue'
import type { PartialModalProps } from '../interfaces/partial-modal.interface'
import type { PartialSubmit } from '../interfaces/payment-submit.interface'

const { t } = useI18n()
const { canExcludeLessons } = usePermissions()

const props = defineProps<PartialModalProps>()
const emit = defineEmits<{
  close: []
  calculate: [date: Date | null]
  clear: []
  confirm: [submit: PartialSubmit]
}>()

const { method, paidAt, comment, toForm } = useReceptionForm(() => props.open)
const { amount, exclusion, payable, error, valid, setExclusion } = usePartialAmount(
  () => props.payment,
  () => props.calculation,
  () => props.open,
)

function onClearDate(): void {
  amount.value = null
  emit('clear')
}

function submit(): void {
  if (!amount.value) return
  emit('confirm', { amount: amount.value, exclusion: exclusion.value.form, reception: toForm() })
}
</script>
