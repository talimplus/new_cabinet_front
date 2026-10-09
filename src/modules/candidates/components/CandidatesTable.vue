<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :row-offset="rowOffset"
    :empty-text="t('candidates.empty')"
  >
    <template #cell-fullName="{ row }">{{ fullName(row as Candidate) }}</template>
    <template #cell-phone="{ row }">
      <span class="whitespace-nowrap font-mono">{{ formatPhone((row as Candidate).phone) || '—' }}</span>
    </template>
    <template #cell-birthYear="{ row }"><span class="font-mono">{{ (row as Candidate).birthYear }}</span></template>
    <template #cell-subject="{ row }">{{ (row as Candidate).subject?.name ?? '—' }}</template>
    <template v-for="key in TEXT_KEYS" :key="key" #[`cell-${key}`]="{ row }">
      <span class="block max-w-[16rem] truncate" :title="(row as Candidate)[key] ?? ''">{{ (row as Candidate)[key] || '—' }}</span>
    </template>
    <template #cell-createdAt="{ row }">
      <span class="font-mono">{{ formatDate((row as Candidate).createdAt) }}</span>
    </template>
    <template #actions="{ row }">
      <div v-if="canManage" class="flex justify-end gap-1">
        <UiIconButton :icon="Pencil" tone="primary" :label="t('common.edit')" @click="emit('edit', row as Candidate)" />
        <UiIconButton :icon="Trash2" tone="danger" :label="t('common.delete')" @click="emit('delete', row as Candidate)" />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiIconButton } from '@/shared/components'
import { Pencil, Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import { formatPhone } from '@/shared/utils/format-phone'
import type { Candidate } from '../interfaces/candidate.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: Candidate[]; loading?: boolean; rowOffset?: number; canManage?: boolean }>()
const emit = defineEmits<{ edit: [candidate: Candidate]; delete: [candidate: Candidate] }>()

/** Long free-text columns — truncated, full text on hover. */
const TEXT_KEYS = ['experience', 'address', 'comment'] as const

const columns = computed<TableColumn[]>(() => [
  { key: 'index', label: t('candidates.table.index'), rowNumber: true },
  { key: 'fullName', label: t('candidates.table.fullName'), primary: true },
  { key: 'phone', label: t('candidates.table.phone') },
  { key: 'birthYear', label: t('candidates.table.birthYear') },
  { key: 'subject', label: t('candidates.table.subject') },
  { key: 'experience', label: t('candidates.table.experience') },
  { key: 'address', label: t('candidates.table.address'), hideOnMobile: true },
  { key: 'comment', label: t('candidates.table.comment') },
  { key: 'createdAt', label: t('candidates.table.createdAt'), hideOnMobile: true },
])

// Surname first, like every people table in the cabinet.
const fullName = (c: Candidate) => `${c.lastName} ${c.firstName}`.trim()
</script>
