<template>
  <div class="flex items-center justify-end gap-2">
    <template v-if="canPay && payable > 0">
      <UiButton size="sm" variant="secondary" @click="emit('mark-as-paid', payment)">
        {{ t('payments.buttons.payFull') }}
      </UiButton>
      <UiButton size="sm" @click="emit('partial', payment)">
        {{ t('payments.buttons.payPartial') }}
      </UiButton>
    </template>
    <span
      v-else-if="payment.status === PaymentStatus.PAID"
      class="inline-flex items-center gap-1 text-xs text-success"
    >
      <UiIcon :icon="CheckCircle2" :size="14" /> {{ t('payments.status.paid') }}
    </span>

    <!-- Reprinting a check stays available long after the money came in. -->
    <UiIconButton
      v-if="hasReceipts(payment)"
      :icon="History"
      tone="primary"
      :label="t('payments.history.title')"
      @click="emit('history', payment)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon, UiIconButton } from '@/shared/components'
import { CheckCircle2, History } from '@/shared/icons'
import { payableNow, hasReceipts } from '../utils/payable'
import { PaymentStatus } from '../enums/payment-status.enum'
import type { Payment } from '../interfaces/payment.interface'

const { t } = useI18n()

const props = defineProps<{ payment: Payment; canPay?: boolean }>()
const emit = defineEmits<{
  'mark-as-paid': [payment: Payment]
  partial: [payment: Payment]
  history: [payment: Payment]
}>()

const payable = computed(() => payableNow(props.payment))
</script>
