<template>
  <UiTable
    :columns="columns"
    :rows="(rows as unknown as Record<string, unknown>[])"
    :loading="loading"
    :row-class="overdueTint"
    :empty-text="t('payments.table.emptyState')"
  >
    <template #cell-student="{ row }">
      <div class="font-medium text-foreground">{{ fullName(row as Payment) }}</div>
      <div class="text-xs text-muted-foreground">{{ (row as Payment).group?.name ?? '—' }}</div>
    </template>
    <template #cell-lessons="{ row }">
      <span class="font-mono">
        {{ (row as Payment).lessonsBillable }} / {{ (row as Payment).lessonsPlanned }}
      </span>
      <div v-if="(row as Payment).lessonsExcused" class="text-xs text-info">
        {{ t('payments.table.excused', { count: (row as Payment).lessonsExcused }) }}
      </div>
    </template>
    <template #cell-amountDue="{ row }">
      <PaymentAmountCell :payment="row as Payment" />
    </template>
    <template #cell-amountPaid="{ row }">
      <span class="font-mono">{{ formatSom(toAmount((row as Payment).amountPaid)) }}</span>
    </template>
    <!-- Collectable from the student — NOT `remainingAmount`, which still counts
         money reception has taken but an admin has not confirmed. -->
    <template #cell-remainingAmount="{ row }">
      <span class="font-mono" :class="payableNow(row as Payment) > 0 && 'font-semibold text-danger'">
        {{ formatSom(payableNow(row as Payment)) }}
      </span>
    </template>
    <template #cell-status="{ row }">
      <PaymentStatusCell :payment="row as Payment" />
    </template>
    <template #cell-pending="{ row }">
      <template v-if="(row as Payment).hasPendingReceipt">
        <div class="text-xs text-muted-foreground">
          {{ t('payments.table.requests', { count: (row as Payment).pendingReceiptsCount ?? 0 }) }}
        </div>
        <div class="font-mono font-semibold text-warning">
          {{ formatSom((row as Payment).pendingAmount ?? 0) }}
        </div>
      </template>
      <span v-else class="text-muted-foreground">—</span>
    </template>
    <template #cell-dueDate="{ row }">
      <span class="font-mono text-xs">{{ formatDate((row as Payment).dueDate) }}</span>
    </template>
    <template #cell-hardDueDate="{ row }">
      <span class="font-mono text-xs">{{ formatDate((row as Payment).hardDueDate) }}</span>
    </template>

    <template #actions="{ row }">
      <PaymentRowActions
        :payment="row as Payment"
        :can-pay="canPay"
        @mark-as-paid="emit('mark-as-paid', $event)"
        @partial="emit('partial', $event)"
        @history="emit('history', $event)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiTable } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { toAmount, payableNow } from '../utils/payable'
import PaymentAmountCell from './PaymentAmountCell.vue'
import PaymentStatusCell from './PaymentStatusCell.vue'
import PaymentRowActions from './PaymentRowActions.vue'
import type { Payment } from '../interfaces/payment.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ columns: TableColumn[]; rows: Payment[]; loading?: boolean; canPay?: boolean }>()
const emit = defineEmits<{
  'mark-as-paid': [payment: Payment]
  partial: [payment: Payment]
  history: [payment: Payment]
}>()

const fullName = (p: Payment) => `${p.student.firstName} ${p.student.lastName}`

/** An overdue row is tinted in both the table and the mobile card. */
const overdueTint = (row: Record<string, unknown>): string | undefined =>
  (row as unknown as Payment).isOverdue ? 'bg-danger-soft/40' : undefined
</script>
