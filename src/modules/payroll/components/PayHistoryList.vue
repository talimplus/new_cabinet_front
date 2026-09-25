<template>
  <div class="space-y-2">
    <p class="text-xs font-semibold text-muted-foreground">{{ t('payroll.modal.previousPayments') }}</p>
    <ul class="max-h-48 space-y-2 overflow-y-auto rounded-lg border border-border p-2">
      <li v-for="p in items" :key="p.id" class="border-b border-border pb-2 last:border-0 last:pb-0">
        <div class="flex items-center justify-between gap-2">
          <span class="font-mono text-sm font-medium">{{ formatSom(p.amount) }}</span>
          <span class="font-mono text-xs text-muted-foreground">{{ formatDate(p.paidAt) }}</span>
        </div>
        <p class="text-xs text-muted-foreground">{{ p.paidBy.firstName }} {{ p.paidBy.lastName }}</p>
        <p v-if="p.comment" class="text-xs text-foreground">{{ p.comment }}</p>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import type { PaymentHistoryItem } from '../interfaces/payment-history-item.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ items: PaymentHistoryItem[] }>()
</script>
