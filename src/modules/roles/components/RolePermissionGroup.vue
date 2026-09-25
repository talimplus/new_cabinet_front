<template>
  <UiCollapse>
    <template #title>{{ catalogLabel(group.label) }}</template>
    <template #meta>
      <UiBadge :variant="selectedCount ? 'primary' : 'neutral'" class="font-mono">
        {{ selectedCount }} / {{ group.permissions.length }}
      </UiBadge>
    </template>

    <UiCheckbox
      :model-value="full"
      :indeterminate="partial"
      :label="t('roles.form.selectGroup')"
      class="mb-3"
      @update:model-value="emit('toggle-group', group, $event)"
    />
    <div class="grid gap-2.5 border-t border-border pt-3 sm:grid-cols-2">
      <UiCheckbox
        v-for="permission in group.permissions"
        :key="permission.key"
        :model-value="selected.includes(permission.key)"
        :label="catalogLabel(permission.label)"
        @update:model-value="emit('toggle', permission.key, $event)"
      />
    </div>
  </UiCollapse>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { UiCollapse, UiCheckbox, UiBadge } from '@/shared/components'
import { useCatalogLabel } from '../composables/use-catalog-label'
import type { PermissionGroup } from '../interfaces/permission-group.interface'

const { t } = useI18n()
const { catalogLabel } = useCatalogLabel()

defineProps<{
  group: PermissionGroup
  selected: string[]
  selectedCount: number
  full: boolean
  partial: boolean
}>()

const emit = defineEmits<{
  toggle: [key: string, checked: boolean]
  'toggle-group': [group: PermissionGroup, checked: boolean]
}>()
</script>
