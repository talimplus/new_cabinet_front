<template>
  <PaymentHistoryModal
    :open="checks.history.open"
    :payment="checks.history.payment"
    :receipts="checks.receipts.value"
    :loading="checks.history.loading"
    :failed="checks.history.failed"
    @close="checks.closeHistory"
    @retry="checks.loadHistory"
    @print="checks.showChecks"
  />

  <CheckModal
    :open="checks.checksOpen.value"
    :checks="checks.checks.value"
    @close="checks.closeChecks"
  />
</template>

<script setup lang="ts">
import PaymentHistoryModal from './PaymentHistoryModal.vue'
import CheckModal from '@/shared/components/receipt/CheckModal.vue'
import type { usePaymentChecks } from '../composables/use-payment-checks'

/** History → print → check modal: the two halves of the same receipt flow. */
defineProps<{ checks: ReturnType<typeof usePaymentChecks> }>()
</script>
