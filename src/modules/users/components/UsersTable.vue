<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('users.empty')"
  >
    <template #cell-role="{ row }">{{ displayRole(row as User) }}</template>
    <template #cell-salary="{ row }">
      <span class="font-mono">{{ formatSom((row as User).salary) }}</span>
    </template>
    <template #cell-commissionPercentage="{ row }">
      {{
        (row as User).commissionPercentage != null ? `${(row as User).commissionPercentage}%` : '—'
      }}
    </template>
    <template #cell-center="{ row }">{{ (row as User).center?.name ?? '—' }}</template>
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiIconButton
          v-if="canView"
          :icon="Eye"
          tone="primary"
          :label="t('common.view')"
          @click="emit('view', row as User)"
        />
        <UiIconButton
          v-if="canEdit"
          :icon="Pencil"
          tone="primary"
          :label="t('common.edit')"
          @click="emit('edit', row as User)"
        />
        <UiIconButton
          v-if="canDelete"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as User)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { UiTable, UiIcon, UiIconButton } from '@/shared/components'
import { Pencil, Trash2, Eye } from '@/shared/icons'
import { formatSom } from '@/shared/utils/format-money'
import { ROLE_LABEL_KEYS } from '../config/role-labels'
import type { User } from '../interfaces/user.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

defineProps<{
  columns: TableColumn[]
  rows: User[]
  loading?: boolean
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
}>()
/** The dynamic role's own name; falls back to the base-role-type label. */
const displayRole = (user: User): string =>
  user.userRole?.name ?? (ROLE_LABEL_KEYS[user.role] ? t(ROLE_LABEL_KEYS[user.role]) : '—')
const emit = defineEmits<{ view: [user: User]; edit: [user: User]; delete: [user: User] }>()
</script>
