<template>
  <div class="space-y-3">
    <p class="rounded-md bg-info-soft px-3 py-2 text-xs text-info">{{ t('staff.receipts.hint') }}</p>

    <UiTable :columns="columns" :rows="(rows as unknown as Record<string, unknown>[])" :empty-text="t('staff.empty.receipts')">
      <template #cell-receivedAt="{ row }">
        <span class="font-mono text-xs">{{ formatDateTime((row as UnsettledReceipt).receivedAt) }}</span>
      </template>
      <template #cell-student="{ row }">
        <div>{{ studentName(row as UnsettledReceipt) }}</div>
        <div v-if="(row as UnsettledReceipt).group" class="text-xs text-muted-foreground">
          {{ (row as UnsettledReceipt).group?.name }}
        </div>
      </template>
      <template #cell-checkNo="{ row }">
        <span class="font-mono">{{ (row as UnsettledReceipt).checkNo ?? '—' }}</span>
      </template>
      <template #cell-amount="{ row }">
        <span class="font-mono font-medium">{{ formatSom((row as UnsettledReceipt).amount) }}</span>
      </template>
      <template #cell-status="{ row }">
        <UiBadge :variant="RECEIPT_STATUS_VARIANTS[(row as UnsettledReceipt).status]">
          {{ t(`staff.receiptStatus.${(row as UnsettledReceipt).status}`) }}
        </UiBadge>
      </template>
    </UiTable>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge } from '@/shared/components'
import { formatDateTime } from '@/shared/utils/format-date'
import { formatSom } from '@/shared/utils/format-money'
import { RECEIPT_STATUS_VARIANTS } from '@/shared/enums/receipt-status.enum'
import type { UnsettledReceipt } from '../interfaces/staff-overview.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: UnsettledReceipt[] }>()

const studentName = (r: UnsettledReceipt) =>
  r.student ? `${r.student.firstName} ${r.student.lastName}` : '—'

const columns = computed<TableColumn[]>(() => [
  { key: 'student', label: t('staff.table.student'), primary: true },
  { key: 'checkNo', label: t('staff.table.checkNo') },
  { key: 'receivedAt', label: t('staff.table.receivedAt') },
  { key: 'amount', label: t('staff.table.amount'), align: 'right' },
  { key: 'status', label: t('payments.table.status') },
])
</script>
