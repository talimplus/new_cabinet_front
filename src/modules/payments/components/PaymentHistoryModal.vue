<template>
  <UiModal :model-value="open" size="xl" @update:model-value="emit('close')">
    <template #header>
      <div class="min-w-0">
        <h2 class="text-base font-semibold text-foreground">{{ t('payments.history.title') }}</h2>
        <p class="truncate text-xs text-muted-foreground">{{ subtitle }}</p>
      </div>
    </template>

    <div class="space-y-3">
      <div
        v-if="failed"
        class="flex flex-wrap items-center justify-between gap-2 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger"
      >
        <span>{{ t('payments.history.loadError') }}</span>
        <UiButton size="sm" variant="outline" @click="emit('retry')">
          {{ t('payments.history.retry') }}
        </UiButton>
      </div>

      <PaymentHistoryTable
        v-else
        :receipts="receipts"
        :loading="loading"
        @print="emit('print', $event)"
      />

      <div
        v-if="receipts.length"
        class="flex items-center justify-between rounded-md bg-surface-muted px-3 py-2 text-sm"
      >
        <span class="font-medium text-muted-foreground">{{ t('common.total') }}</span>
        <span class="font-mono font-semibold text-foreground">{{ formatSom(total) }}</span>
      </div>
    </div>

    <template #footer>
      <UiButton variant="ghost" @click="emit('close')">{{ t('common.close') }}</UiButton>
      <UiButton :disabled="!receipts.length" @click="emit('print', receipts)">
        <UiIcon :icon="Printer" :size="16" />
        {{ t('payments.history.printAll') }}
      </UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiButton, UiIcon } from '@/shared/components'
import { Printer } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import { ReceiptStatus } from '@/shared/enums/receipt-status.enum'
import PaymentHistoryTable from './PaymentHistoryTable.vue'
import type { Payment } from '../interfaces/payment.interface'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

const { t } = useI18n()

const props = defineProps<{
  open: boolean
  payment: Payment | null
  receipts: PaymentCheck[]
  loading?: boolean
  failed?: boolean
}>()
const emit = defineEmits<{ close: []; retry: []; print: [checks: PaymentCheck[]] }>()

const subtitle = computed(() => {
  const p = props.payment
  if (!p) return ''
  return [`${p.student.firstName} ${p.student.lastName}`, p.group?.name, formatMonth(p.forMonth)]
    .filter(Boolean)
    .join(' · ')
})

/** A rejected receipt never reached the till, so it stays out of the total. */
const total = computed(() =>
  props.receipts
    .filter((r) => r.status !== ReceiptStatus.REJECTED)
    .reduce((sum, r) => sum + (Number(r.amount) || 0), 0),
)
</script>
