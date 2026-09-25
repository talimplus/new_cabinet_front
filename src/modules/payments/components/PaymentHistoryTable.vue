<template>
  <UiTable
    :columns="columns"
    :rows="(receipts as unknown as Record<string, unknown>[])"
    :loading="loading"
    row-key="receiptId"
    :empty-text="t('payments.history.empty')"
  >
    <template #cell-checkNo="{ row }">
      <span class="font-mono font-semibold">{{ (row as PaymentCheck).checkNo || '—' }}</span>
    </template>
    <template #cell-receivedAt="{ row }">
      <span class="font-mono text-xs">
        {{ formatDateTime((row as PaymentCheck).receivedAt ?? (row as PaymentCheck).createdAt) }}
      </span>
    </template>
    <template #cell-amount="{ row }">
      <span class="font-mono font-semibold">{{ formatSom((row as PaymentCheck).amount) }}</span>
    </template>
    <template #cell-paymentMethod="{ row }">
      {{ methodLabel(row as PaymentCheck) }}
    </template>
    <template #cell-status="{ row }">
      <UiBadge :variant="RECEIPT_STATUS_VARIANTS[(row as PaymentCheck).status]">
        {{ t(RECEIPT_STATUS_LABEL_KEYS[(row as PaymentCheck).status]) }}
      </UiBadge>
    </template>
    <template #cell-receivedBy="{ row }">
      {{ (row as PaymentCheck).receivedBy?.fullName || '—' }}
    </template>
    <template #cell-comment="{ row }">
      <span class="text-muted-foreground">{{ (row as PaymentCheck).comment || '—' }}</span>
    </template>
    <template #actions="{ row }">
      <UiIconButton
        :icon="Printer"
        tone="primary"
        :label="t('payments.history.printOne')"
        @click="emit('print', [row as PaymentCheck])"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIconButton } from '@/shared/components'
import { Printer } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatDateTime } from '@/shared/utils/format-date'
import { PAYMENT_METHOD_LABEL_KEYS } from '@/shared/enums/payment-method.enum'
import {
  RECEIPT_STATUS_LABEL_KEYS,
  RECEIPT_STATUS_VARIANTS,
} from '@/shared/enums/receipt-status.enum'
import { RECEIPT_COLUMNS } from '../config/receipt-columns'
import type { PaymentCheck } from '@/shared/interfaces/payment-check.interface'

const { t } = useI18n()

defineProps<{ receipts: PaymentCheck[]; loading?: boolean }>()
const emit = defineEmits<{ print: [checks: PaymentCheck[]] }>()

const columns = computed(() => RECEIPT_COLUMNS.map((c) => ({ ...c, label: t(c.label) })))

const methodLabel = (check: PaymentCheck): string =>
  check.paymentMethod ? t(PAYMENT_METHOD_LABEL_KEYS[check.paymentMethod]) : '—'
</script>
