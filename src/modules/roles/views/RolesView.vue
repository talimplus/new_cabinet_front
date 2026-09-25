<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { UiButton, UiIcon } from '@/shared/components'
import { Plus } from '@/shared/icons'
import { usePermissions } from '@/shared/composables/use-permissions'
import { useRoles } from '../composables/use-roles'
import RolesTable from '../components/RolesTable.vue'
import RoleFormModal from '../components/RoleFormModal.vue'
import RoleDeleteDialog from '../components/RoleDeleteDialog.vue'
import type { RoleForm } from '../interfaces/role-form.interface'

const { t } = useI18n()
const { canManageRoles } = usePermissions()
const r = useRoles()
onMounted(r.load)

const modalRef = ref<{ setBackendErrors: (e: unknown) => void } | null>(null)
const saving = ref(false)
const deleting = ref(false)
const deleteOpen = computed({
  get: () => r.deleteTarget.value !== null,
  set: (open: boolean) => { if (!open) r.deleteTarget.value = null },
})

async function onSubmit(payload: RoleForm) {
  saving.value = true
  try {
    await r.submit(payload)
  } catch (error) {
    modalRef.value?.setBackendErrors(error)
  } finally {
    saving.value = false
  }
}
async function onConfirmDelete() {
  deleting.value = true
  try {
    await r.confirmDelete()
  } finally {
    deleting.value = false
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-start justify-between gap-3">
      <p class="max-w-2xl text-sm text-muted-foreground">{{ t('roles.subtitle') }}</p>
      <UiButton v-if="canManageRoles" class="ml-auto" @click="r.openCreate">
        <UiIcon :icon="Plus" :size="16" /> {{ t('roles.create') }}
      </UiButton>
    </div>

    <RolesTable
      :rows="r.roles.value"
      :loading="r.loading.value"
      :can-manage="canManageRoles"
      @edit="r.openEdit"
      @delete="r.requestDelete"
    />

    <RoleFormModal
      ref="modalRef"
      v-model="r.formOpen.value"
      :editing="r.editing.value"
      :catalog="r.catalog.value"
      :loading="saving"
      @submit="onSubmit"
    />
    <RoleDeleteDialog
      v-model="deleteOpen"
      :role="r.deleteTarget.value"
      :loading="deleting"
      @confirm="onConfirmDelete"
    />
  </div>
</template>
