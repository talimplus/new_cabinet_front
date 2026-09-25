<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :row-class="selectedTint"
    :empty-text="hasFilters ? t('pendingReceipts.emptyFiltered') : t('pendingReceipts.empty')"
  >
    <!-- The tick-box rides in the name cell so the mobile card needs no extra row. -->
    <template #cell-student="{ row }">
      <UiCheckbox
        v-if="canConfirm"
        :model-value="isSelected((row as PendingReceipt).id)"
        :disabled="processing"
        :label="studentName(row as PendingReceipt)"
        @update:model-value="emit('toggle', row as PendingReceipt)"
      />
      <span v-else class="font-medium text-foreground">{{ studentName(row as PendingReceipt) }}</span>
    </template>
    <template #cell-group="{ row }">
      {{ (row as PendingReceipt).payment.group?.name ?? '—' }}
    </template>
    <template #cell-month="{ row }">
      {{ formatMonth((row as PendingReceipt).payment.forMonth) }}
    </template>
    <template #cell-amount="{ row }">
      <span class="font-mono font-semibold text-primary">
        {{ formatSom(parseFloat((row as PendingReceipt).amount)) }}
      </span>
    </template>
    <template #cell-receivedAt="{ row }">
      <span class="font-mono text-xs">
        {{ formatDateTime((row as PendingReceipt).receivedAt ?? (row as PendingReceipt).createdAt) }}
      </span>
    </template>
    <template #actions="{ row }">
      <div class="flex flex-wrap justify-end gap-2">
        <UiButton
          v-if="canConfirm"
          size="sm"
          :disabled="processing"
          @click="emit('confirm', row as PendingReceipt)"
        >
          {{ t('pendingReceipts.approve') }}
        </UiButton>
        <UiButton
          v-if="canReject"
          size="sm"
          variant="outline"
          :disabled="processing"
          @click="emit('reject', row as PendingReceipt)"
        >
          {{ t('pendingReceipts.reject') }}
        </UiButton>
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiTable, UiButton, UiCheckbox } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatDateTime } from '@/shared/utils/format-date'
import { formatMonth } from '@/shared/utils/format-month'
import type { PendingReceipt } from '../interfaces/pending-receipt.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps<{
  rows: PendingReceipt[]
  isSelected: (id: number) => boolean
  loading?: boolean
  processing?: boolean
  hasFilters?: boolean
  canConfirm?: boolean
  canReject?: boolean
}>()
const emit = defineEmits<{
  toggle: [receipt: PendingReceipt]
  confirm: [receipt: PendingReceipt]
  reject: [receipt: PendingReceipt]
}>()

const columns = computed<TableColumn[]>(() => [
  { key: 'student', label: t('pendingReceipts.columns.student'), primary: true },
  { key: 'group', label: t('pendingReceipts.columns.group') },
  { key: 'month', label: t('pendingReceipts.columns.month') },
  { key: 'amount', label: t('pendingReceipts.amount'), align: 'right' },
  { key: 'receivedAt', label: t('pendingReceipts.columns.receivedAt') },
])

const studentName = (r: PendingReceipt) =>
  `${r.payment.student.firstName} ${r.payment.student.lastName}`

const selectedTint = (row: Record<string, unknown>): string | undefined =>
  props.isSelected((row as unknown as PendingReceipt).id) ? 'bg-primary-soft' : undefined
</script>
