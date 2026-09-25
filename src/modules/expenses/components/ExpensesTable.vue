<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('expenses.noExpensesForMonth')"
  >
    <template #cell-amount="{ row }">
      <span class="font-mono">{{ formatSom(Number((row as Expense).amount)) }}</span>
    </template>
    <template #cell-description="{ row }">
      <span class="block max-w-[16rem] truncate" :title="(row as Expense).description || ''">{{
        (row as Expense).description || '—'
      }}</span>
    </template>
    <template #cell-forMonth="{ row }">
      <span class="font-mono">{{ formatMonth((row as Expense).forMonth) }}</span>
    </template>
    <template #cell-center="{ row }">{{ (row as Expense).center?.name ?? '—' }}</template>
    <template #cell-createdAt="{ row }">
      <span class="font-mono">{{ formatDate((row as Expense).createdAt) }}</span>
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiIconButton
          v-if="canEdit"
          :icon="Pencil"
          tone="primary"
          :label="t('common.edit')"
          @click="emit('edit', row as Expense)"
        />
        <UiIconButton
          v-if="canDelete"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as Expense)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiTable, UiIcon, UiIconButton } from '@/shared/components'
import { Pencil, Trash2 } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { formatMonth } from '../utils/month'
import type { Expense } from '../interfaces/expense.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ rows: Expense[]; loading?: boolean; canEdit?: boolean; canDelete?: boolean }>()
const emit = defineEmits<{ edit: [expense: Expense]; delete: [expense: Expense] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('expenses.name') },
  { key: 'amount', label: t('expenses.amount'), align: 'right' },
  { key: 'description', label: t('expenses.description') },
  { key: 'forMonth', label: t('expenses.month') },
  { key: 'center', label: t('common.center') },
  { key: 'createdAt', label: t('expenses.date') },
])
</script>
