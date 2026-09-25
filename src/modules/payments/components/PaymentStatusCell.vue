<template>
  <div class="flex flex-wrap items-center gap-1">
    <UiBadge :variant="PAYMENT_STATUS_VARIANTS[payment.status]">
      {{ t(PAYMENT_STATUS_LABEL_KEYS[payment.status]) }}
    </UiBadge>
    <UiBadge v-if="payment.isOverdue" variant="danger">{{ t('payments.chips.overdue') }}</UiBadge>
    <UiBadge v-if="payment.hasPendingReceipt" variant="warning">
      <UiIcon :icon="Clock" :size="12" /> {{ t('payments.chips.pendingAdmin') }}
    </UiBadge>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiBadge, UiIcon } from '@/shared/components'
import { Clock } from '@/shared/icons'
import { PAYMENT_STATUS_LABEL_KEYS, PAYMENT_STATUS_VARIANTS } from '../enums/payment-status.enum'
import type { Payment } from '../interfaces/payment.interface'

const { t } = useI18n()

defineProps<{ payment: Payment }>()
</script>
