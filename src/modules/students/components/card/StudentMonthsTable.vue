<template>
  <UiTable
    :columns="columns"
    :rows="(months as unknown as Record<string, unknown>[])"
    :loading="loading"
    row-key="paymentId"
    :empty-text="t('students.view.table.empty')"
  >
    <template #cell-forMonth="{ row }">
      <span class="font-mono">{{ formatMonth((row as StudentSummaryMonth).forMonth) }}</span>
    </template>
    <template #cell-lessons="{ row }">
      <span v-if="(row as StudentSummaryMonth).lessonsPlanned != null" class="font-mono">
        {{ (row as StudentSummaryMonth).lessonsBillable ?? 0 }} /
        {{ (row as StudentSummaryMonth).lessonsPlanned }}
      </span>
      <span v-else class="text-muted-foreground">—</span>
    </template>
    <template #cell-amountDue="{ row }">
      <StudentMonthAmountCell :month="row as StudentSummaryMonth" />
    </template>
    <template #cell-amountPaid="{ row }">
      <span class="font-mono">{{ formatSom((row as StudentSummaryMonth).amountPaid) }}</span>
    </template>
    <!-- What to collect FROM THE STUDENT; the till's own debt is the hint below. -->
    <template #cell-payableNow="{ row }">
      <span
        class="font-mono"
        :class="(row as StudentSummaryMonth).payableNow > 0 && 'font-semibold text-danger'"
      >
        {{ formatSom((row as StudentSummaryMonth).payableNow) }}
      </span>
      <p v-if="(row as StudentSummaryMonth).pendingAmount > 0" class="text-xs text-muted-foreground">
        {{ t('students.view.table.cashDebtHint', {
          amount: formatSom((row as StudentSummaryMonth).remaining),
        }) }}
      </p>
    </template>
    <template #cell-status="{ row }">
      <UiBadge :variant="PAYMENT_STATUS_VARIANTS[(row as StudentSummaryMonth).status]">
        {{ t(PAYMENT_STATUS_LABEL_KEYS[(row as StudentSummaryMonth).status]) }}
      </UiBadge>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatMonth } from '@/shared/utils/format-month'
import {
  PAYMENT_STATUS_LABEL_KEYS,
  PAYMENT_STATUS_VARIANTS,
} from '@/modules/payments/enums/payment-status.enum'
import StudentMonthAmountCell from './StudentMonthAmountCell.vue'
import type { StudentSummaryMonth } from '../../interfaces/student-summary.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ months: StudentSummaryMonth[]; loading?: boolean }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'forMonth', label: t('students.view.table.month'), primary: true },
  { key: 'groupName', label: t('students.view.table.group') },
  { key: 'lessons', label: t('students.view.table.lessons') },
  { key: 'amountDue', label: t('students.view.table.amountDue'), align: 'right' },
  { key: 'amountPaid', label: t('students.view.table.amountPaid'), align: 'right' },
  { key: 'payableNow', label: t('students.view.table.payableNow'), align: 'right' },
  { key: 'status', label: t('students.view.table.status') },
])
</script>
