<template>
  <div>
    <span class="font-mono">{{ formatSom(toAmount(payment.amountDue)) }}</span>
    <!-- Money handed back after the month was already paid. -->
    <div v-if="refunded > 0" class="text-xs text-success">
      {{ t('payments.table.refunded', { amount: formatSom(refunded) }) }}
    </div>
    <!-- Written off by an admin; the reason is part of the record. -->
    <div v-if="excluded > 0" class="text-xs text-warning">
      {{ t('payments.table.excluded', { amount: formatSom(excluded) }) }}
      <span v-if="payment.manualExcludedReason">({{ payment.manualExcludedReason }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatSom } from '@/shared/utils/format-money'
import { toAmount } from '../utils/payable'
import type { Payment } from '../interfaces/payment.interface'

const { t } = useI18n()

const props = defineProps<{ payment: Payment }>()

const refunded = computed(() => toAmount(props.payment.refundedAmount))
const excluded = computed(() => toAmount(props.payment.manualExcludedAmount))
</script>
