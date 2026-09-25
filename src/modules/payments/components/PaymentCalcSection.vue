<template>
  <!-- Recalculating writes the new stop-study date back, so it needs both keys. -->
  <div v-if="canRecalculatePayment && canEditPayment" class="space-y-3">
    <PaymentCalcControl
      :date="date"
      :calculating="calculating"
      :disabled="disabled"
      @calculate="emit('calculate', $event)"
      @clear="emit('clear')"
    />
    <PaymentCalcSummary v-if="calculation" :calc="calculation" />
  </div>
</template>

<script setup lang="ts">
import { usePermissions } from '@/shared/composables/use-permissions'
import PaymentCalcControl from './PaymentCalcControl.vue'
import PaymentCalcSummary from './PaymentCalcSummary.vue'
import type { PaymentCalculationResponse } from '../interfaces/payment-calculation.interface'

const { canRecalculatePayment, canEditPayment } = usePermissions()

defineProps<{
  date: Date | null
  calculation: PaymentCalculationResponse | null
  calculating?: boolean
  disabled?: boolean
}>()
const emit = defineEmits<{ calculate: [date: Date | null]; clear: [] }>()
</script>
