<template>
  <UiTable
    :columns="columns"
    :rows="rows as unknown as Record<string, unknown>[]"
    :loading="loading"
    :empty-text="t('roles.empty')"
  >
    <template #cell-name="{ row }">
      <div class="flex flex-wrap items-center gap-2">
        <span class="font-medium text-foreground">{{ (row as Role).name }}</span>
        <UiBadge v-if="(row as Role).isLocked" variant="primary">{{
          t('roles.badges.locked')
        }}</UiBadge>
        <UiBadge v-else-if="(row as Role).isSystem" variant="neutral">{{
          t('roles.badges.system')
        }}</UiBadge>
      </div>
    </template>
    <template #cell-baseRole="{ row }">{{ t(baseRoleLabelKey((row as Role).baseRole)) }}</template>
    <template #cell-permissions="{ row }">
      <span v-if="(row as Role).permissions.includes(ALL_PERMISSIONS)">
        {{ t('roles.allPermissions') }}
      </span>
      <span v-else class="font-mono">
        {{ t('roles.permissionCount', { count: (row as Role).permissions.length }) }}
      </span>
    </template>
    <template #cell-userCount="{ row }"
      ><span class="font-mono">{{ (row as Role).userCount }}</span></template
    >
    <template #actions="{ row }">
      <div class="flex justify-end gap-1">
        <UiIconButton
          v-if="canManage && !(row as Role).isLocked"
          :icon="Pencil"
          tone="primary"
          :label="t('common.edit')"
          @click="emit('edit', row as Role)"
        />
        <UiIconButton
          v-if="canManage && !(row as Role).isSystem && !(row as Role).isLocked"
          :icon="Trash2"
          tone="danger"
          :label="t('common.delete')"
          @click="emit('delete', row as Role)"
        />
      </div>
    </template>
  </UiTable>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiTable, UiBadge, UiIcon, UiIconButton } from '@/shared/components'
import { Pencil, Trash2 } from '@/shared/icons'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { baseRoleLabelKey } from '../config/base-roles'
import type { Role } from '../interfaces/role.interface'
import type { TableColumn } from '@/shared/interfaces/table-column.interface'

const { t } = useI18n()

defineProps<{ rows: Role[]; loading?: boolean; canManage?: boolean }>()
const emit = defineEmits<{ edit: [role: Role]; delete: [role: Role] }>()

const columns = computed<TableColumn[]>(() => [
  { key: 'name', label: t('roles.table.name') },
  { key: 'baseRole', label: t('roles.table.baseRole') },
  { key: 'permissions', label: t('roles.table.permissions') },
  { key: 'userCount', label: t('roles.table.userCount') },
])
</script>
