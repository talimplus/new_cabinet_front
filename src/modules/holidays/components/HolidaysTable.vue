<template>
  <UiTable :columns="columns" :rows="rows as unknown as Row[]" :loading="loading" :empty-text="t('holidays.empty')">
    <template #cell-name="{ row }"><span class="font-semibold text-foreground">{{ (row as Holiday).name }}</span></template>
    <template #cell-dates="{ row }">
      <span class="font-mono text-sm">{{ range(row as Holiday) }}</span>
      <span class="ml-2 text-xs text-muted-foreground">{{ t('holidays.days', { count: days(row as Holiday) }) }}</span>
    </template>
    <template #cell-center="{ row }">
      <UiBadge :variant="(row as Holiday).centerId === null ? 'primary' : 'neutral'">{{ centerLabel((row as Holiday).centerId) }}</UiBadge>
    </template>
    <template #actions="{ row }">
      <div class="flex justify-end">
        <UiIconButton v-if="canManage" :icon="Trash2" tone="danger" :label="t('common.delete')" @click="emit('delete', row as Holiday)" />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIconButton } from '@/shared/components'
import { Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import type { Holiday } from '../interfaces/holiday.interface'

type Row = Record<string, unknown>
const { t } = useI18n()
defineProps<{ rows: Holiday[]; loading?: boolean; canManage?: boolean; centerLabel: (id: number | null) => string }>()
const emit = defineEmits<{ delete: [Holiday] }>()

const range = (h: Holiday): string =>
  h.fromDate === h.toDate ? formatDate(h.fromDate) : `${formatDate(h.fromDate)} – ${formatDate(h.toDate)}`
const days = (h: Holiday): number =>
  Math.round((new Date(h.toDate).getTime() - new Date(h.fromDate).getTime()) / 86_400_000) + 1

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('holidays.table.name'), primary: true },
  { key: 'dates', label: t('holidays.table.dates') },
  { key: 'center', label: t('holidays.table.center') },
])
</script>
