<template>
  <UiModal
    :model-value="modelValue"
    :title="editing ? t('roles.form.editTitle') : t('roles.form.createTitle')"
    size="xl"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-5">
      <div class="grid gap-3 sm:grid-cols-2">
        <UiInput v-model="form.name" :label="t('roles.form.name')" :error="errors.name" required />
        <UiSelect
          :model-value="form.baseRole"
          :options="baseRoleOptions"
          :label="t('roles.form.baseRole')"
          :hint="t('roles.form.baseRoleHint')"
          :searchable="false"
          :clearable="false"
          :disabled="editing?.isSystem"
          @update:model-value="onBaseRole"
        />
      </div>

      <RolePermissionCatalog v-model:selected="form.permissions" :catalog="catalog" />
    </div>

    <template #footer>
      <UiButton variant="outline" @click="emit('update:modelValue', false)">{{ t('common.cancel') }}</UiButton>
      <UiButton :loading="loading" @click="onSave">{{ t('common.save') }}</UiButton>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiModal, UiInput, UiSelect, UiButton } from '@/shared/components'
import RolePermissionCatalog from './RolePermissionCatalog.vue'
import { ASSIGNABLE_BASE_ROLES, baseRoleLabelKey } from '../config/base-roles'
import { mapBackendErrors } from '@/shared/utils/backend-errors'
import { ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { Role } from '../interfaces/role.interface'
import type { PermissionGroup } from '../interfaces/permission-group.interface'
import type { RoleForm } from '../interfaces/role-form.interface'

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
  editing: Role | null
  catalog: PermissionGroup[]
  loading?: boolean
}>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; submit: [payload: RoleForm] }>()

const form = reactive<RoleForm>({ name: '', baseRole: UserRole.OTHER, permissions: [] })
const errors = reactive<Record<string, string>>({})

const baseRoleOptions = computed(() =>
  ASSIGNABLE_BASE_ROLES.map((value) => ({ label: t(baseRoleLabelKey(value)), value })),
)

function onBaseRole(value: string | number | Array<string | number> | null): void {
  if (typeof value === 'string') form.baseRole = value as UserRole
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    Object.keys(errors).forEach((k) => delete errors[k])
    form.name = props.editing?.name ?? ''
    form.baseRole = props.editing?.baseRole ?? UserRole.OTHER
    // `*` is the Administrator's wildcard — never a tickable catalog key.
    form.permissions = (props.editing?.permissions ?? []).filter((k) => k !== ALL_PERMISSIONS)
  },
)

function onSave(): void {
  if (!form.name.trim()) {
    errors.name = t('roles.form.nameRequired')
    return
  }
  delete errors.name
  emit('submit', { ...form, name: form.name.trim(), permissions: [...form.permissions] })
}

defineExpose({
  setBackendErrors: (error: unknown) => Object.assign(errors, mapBackendErrors(error)),
})
</script>
