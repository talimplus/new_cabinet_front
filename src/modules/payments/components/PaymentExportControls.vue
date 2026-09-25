<template>
  <PaymentExportButtons
    :exporting-month="exporter.exportingMonth.value"
    :exporting-period="exporter.exportingPeriod.value"
    @month="exporter.exportMonth"
    @period="exporter.openPeriod"
  />

  <PaymentPeriodExportModal
    :open="exporter.period.open"
    :from="exporter.period.from"
    :to="exporter.period.to"
    :loading="exporter.exportingPeriod.value"
    @update:from="exporter.period.from = $event"
    @update:to="exporter.period.to = $event"
    @close="exporter.closePeriod"
    @confirm="exporter.exportPeriod"
  />
</template>

<script setup lang="ts">
import PaymentExportButtons from './PaymentExportButtons.vue'
import PaymentPeriodExportModal from './PaymentPeriodExportModal.vue'
import type { usePaymentExport } from '../composables/use-payment-export'

/** Both Excel buttons plus the range dialog — one cohesive unit of the exporter. */
defineProps<{ exporter: ReturnType<typeof usePaymentExport> }>()
</script>
