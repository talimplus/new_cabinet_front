<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('leads.empty')"
  >
    <template #cell-fullName="{ row }">{{ fullName(row as Lead) }}</template>
    <template #cell-phone="{ row }"
      ><span class="font-mono">{{ (row as Lead).phone }}</span></template
    >
    <template #cell-followUpDate="{ row }">
      <span class="font-mono">{{ formatDate((row as Lead).followUpDate) }}</span>
    </template>
    <template #cell-status="{ row }">
      <LeadStatusCell
        :status="(row as Lead).status"
        :can-edit="canEdit"
        :loading="(row as Lead).statusLoading"
        @change="(s: LeadStatus) => emit('status-change', row as Lead, s)"
      />
    </template>
    <template #actions="{ row }">
      <div v-if="canEdit || canDelete" class="flex justify-end gap-1">
        <UiIconButton
          v-if="canEdit"
          :icon="Pencil"
          tone="primary"
          :label="t('common.edit')"
          @click="emit('edit', row as Lead)"
        />
        <UiIconButton
          v-if="canDelete"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as Lead)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiTable, UiIcon, UiIconButton } from '@/shared/components'
import { Pencil, Trash2 } from '@/shared/icons'
import { formatDate } from '@/shared/utils/format-date'
import LeadStatusCell from './LeadStatusCell.vue'
import type { LeadStatus } from '../enums/lead-status.enum'
import type { Lead } from '../interfaces/lead.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{ rows: Lead[]; loading?: boolean; canEdit?: boolean; canDelete?: boolean }>()
const emit = defineEmits<{
  edit: [lead: Lead]
  delete: [lead: Lead]
  'status-change': [lead: Lead, status: LeadStatus]
}>()

const columns = computed<TableColumn[]>(() => [
  { key: 'id', label: t('leads.table.id'), hideOnMobile: true },
  { key: 'fullName', label: t('leads.table.fullName'), primary: true },
  { key: 'phone', label: t('leads.table.phone') },
  { key: 'status', label: t('leads.table.status') },
  { key: 'followUpDate', label: t('leads.table.followUpDate') },
])

const fullName = (l: Lead) => `${l.firstName ?? ''} ${l.lastName ?? ''}`.trim() || '—'
</script>
