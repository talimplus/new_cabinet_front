<template>
  <div class="flex flex-wrap items-center gap-1">
    <!-- The student handed the whole month over; only the admin's confirmation
         is missing — "To'lanmagan" here would read as an open debt. -->
    <UiBadge v-if="handedOver" variant="warning">
      <UiIcon :icon="Clock" :size="12" /> {{ t('payments.chips.handedOver') }}
    </UiBadge>
    <UiBadge v-else :variant="PAYMENT_STATUS_VARIANTS[payment.status]">
      {{ t(PAYMENT_STATUS_LABEL_KEYS[payment.status]) }}
    </UiBadge>
    <UiBadge v-if="payment.isOverdue" variant="danger">{{ t('payments.chips.overdue') }}</UiBadge>
    <UiBadge v-if="payment.hasPendingReceipt && !handedOver" variant="warning">
      <UiIcon :icon="Clock" :size="12" /> {{ t('payments.chips.pendingAdmin') }}
    </UiBadge>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiBadge, UiIcon } from '@/shared/components'
import { Clock } from '@/shared/icons'
import { PaymentStatus, PAYMENT_STATUS_LABEL_KEYS, PAYMENT_STATUS_VARIANTS } from '../enums/payment-status.enum'
import { payableNow } from '../utils/payable'
import type { Payment } from '../interfaces/payment.interface'

const { t } = useI18n()

const props = defineProps<{ payment: Payment }>()

/** Nothing left to collect from the student, but not confirmed yet. */
const handedOver = computed(
  () =>
    !!props.payment.hasPendingReceipt &&
    props.payment.status !== PaymentStatus.PAID &&
    payableNow(props.payment) <= 0,
)
</script>
