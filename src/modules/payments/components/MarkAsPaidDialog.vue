<template>
  <UiModal
    :model-value="open"
    :title="t('payments.dialog.markTitle')"
    size="md"
    @update:model-value="emit('close')"
  >
    <div class="space-y-4">
      <p class="text-sm text-foreground">
        {{ t('payments.dialog.markConfirm', { name: studentName }) }}
      </p>

      <PaymentSummaryBlock :payment="payment" :payable="payable" />

      <!-- Keyed so a write-off typed for one row never rides along with the next. -->
      <PaymentExclusionCard
        v-if="canExcludeLessons"
        :key="`excl-full-${payment?.id}`"
        :payment="payment"
        :disabled="loading"
        @change="exclusion = $event"
      />
      <ReceptionFields
        v-model:method="method"
        v-model:paid-at="paidAt"
        v-model:comment="comment"
        :disabled="loading"
      />
    </div>

    <template #footer>
      <PaymentDialogFooter
        :loading="loading"
        :disabled="confirmDisabled"
        @cancel="emit('close')"
        @confirm="submit"
      />
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal } from '@/shared/components'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useReceptionForm } from '@/shared/composables/use-reception-form'
import { payableAfterExclusion } from '../utils/payable'
import { emptyExclusionState } from '../interfaces/payment-exclusion.interface'
import PaymentSummaryBlock from './PaymentSummaryBlock.vue'
import PaymentExclusionCard from './PaymentExclusionCard.vue'
import ReceptionFields from '@/shared/components/receipt/ReceptionFields.vue'
import PaymentDialogFooter from './PaymentDialogFooter.vue'
import type { Payment } from '../interfaces/payment.interface'
import type { ExclusionState } from '../interfaces/payment-exclusion.interface'
import type { MarkAsPaidSubmit } from '../interfaces/payment-submit.interface'

const { t } = useI18n()
const { canExcludeLessons } = usePermissions()

const props = defineProps<{ open: boolean; payment: Payment | null; loading?: boolean }>()
const emit = defineEmits<{ close: []; confirm: [submit: MarkAsPaidSubmit] }>()

const { method, paidAt, comment, toForm } = useReceptionForm(() => props.open)
const exclusion = ref<ExclusionState>(emptyExclusionState())

watch(() => props.open, (open) => { if (open) exclusion.value = emptyExclusionState() })

const studentName = computed(() =>
  props.payment ? `${props.payment.student.firstName} ${props.payment.student.lastName}` : '',
)
const payable = computed(() => payableAfterExclusion(props.payment, exclusion.value))

// The backend rejects a zero payment, so a write-off that clears the debt also
// disables the button — as does an unfinished preview or a missing reason.
const confirmDisabled = computed(
  () => exclusion.value.previewing || !exclusion.value.valid || payable.value <= 0,
)

function submit(): void {
  emit('confirm', { exclusion: exclusion.value.form, reception: toForm() })
}
</script>
