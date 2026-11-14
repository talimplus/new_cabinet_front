<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t(archive ? 'users.archive.empty' : 'users.empty')"
    :row-class="blockedRowClass"
    :row-click="canView ? (row) => emit('view', row as unknown as User) : undefined"
  >
    <template #cell-firstName="{ row }">
      {{ (row as User).firstName }}
      <UiBadge v-if="(row as User).dismissedAt" variant="neutral" class="ml-1">{{ t('users.archive.badge') }}</UiBadge>
      <UiBadge v-else-if="(row as User).isActive === false" variant="danger" class="ml-1">{{ t('users.blocked') }}</UiBadge>
    </template>
    <template #cell-role="{ row }">{{ displayRole(row as User) }}</template>
    <template #cell-salary="{ row }">
      <span class="font-mono">{{ formatSom((row as User).salary) }}</span>
    </template>
    <template #cell-commissionPercentage="{ row }">
      {{
        (row as User).commissionPercentage != null ? `${(row as User).commissionPercentage}%` : '—'
      }}
    </template>
    <template #cell-dismissedAt="{ row }">
      <span class="font-mono">{{ formatDate((row as User).dismissedAt) || '—' }}</span>
    </template>
    <template #cell-dismissalReason="{ row }">{{ (row as User).dismissalReason || '—' }}</template>
    <template #cell-center="{ row }">{{ (row as User).center?.name ?? '—' }}</template>
    <template #actions="{ row }">
      <UserRowActions
        :user="row as User" :can-view="canView" :can-edit="canEdit" :can-delete="canDelete" :can-pay="canPay" :self-id="selfId"
        @view="emit('view', row as User)" @edit="emit('edit', row as User)" @delete="emit('delete', row as User)"
        @toggle-active="emit('toggleActive', row as User)" @dismiss="emit('dismiss', row as User)"
        @reinstate="emit('reinstate', row as User)" @advance="emit('advance', row as User)" @bonus="emit('bonus', row as User)"
      />
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { UiTable, UiBadge } from '@/shared/components'
import { formatSom } from '@/shared/utils/format-money'
import { formatDate } from '@/shared/utils/format-date'
import { ROLE_LABEL_KEYS } from '../config/role-labels'
import type { User } from '../interfaces/user.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'
import { useI18n } from 'vue-i18n'
import UserRowActions from './UserRowActions.vue'

const { t } = useI18n()

defineProps<{
  columns: TableColumn[]
  rows: User[]
  loading?: boolean
  /** The archive tab (dismissed employees). */
  archive?: boolean
  canView?: boolean
  canEdit?: boolean
  canDelete?: boolean
  /** `payroll.pay` — advance / bonus buttons. */
  canPay?: boolean
  /** The signed-in user — nobody can block themself. */
  selfId?: number | null
}>()
/** A blocked employee's row is dimmed (both table and mobile card). */
const blockedRowClass = (row: Record<string, unknown>): string | undefined =>
  row.isActive === false && !row.dismissedAt ? 'opacity-60' : undefined
/** The dynamic role's own name; falls back to the base-role-type label. */
const displayRole = (user: User): string =>
  user.userRole?.name ?? (ROLE_LABEL_KEYS[user.role] ? t(ROLE_LABEL_KEYS[user.role]) : '—')
const emit = defineEmits<{
  view: [user: User]
  edit: [user: User]
  delete: [user: User]
  toggleActive: [user: User]
  dismiss: [user: User]
  reinstate: [user: User]
  advance: [user: User]
  bonus: [user: User]
}>()
</script>
