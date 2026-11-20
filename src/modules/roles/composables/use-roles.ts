import { ref } from 'vue'
import { fetchRoles, fetchPermissionCatalog, createRole, updateRole, deleteRole, resetRole } from '../api/roles.api'
import { useNotificationStore } from '@/stores/notification.store'
import { t } from '@/locales'
import type { Role } from '../interfaces/role.interface'
import type { PermissionGroup } from '../interfaces/permission-group.interface'
import type { RoleForm, RoleUpdateForm } from '../interfaces/role-form.interface'

/**
 * List/state logic for `/roles`. The roles and the permission catalog are
 * fetched together — the form is useless without the catalog.
 */
export function useRoles() {
  const notify = useNotificationStore()

  const roles = ref<Role[]>([])
  const catalog = ref<PermissionGroup[]>([])
  const loading = ref(false)

  const formOpen = ref(false)
  const editing = ref<Role | null>(null)
  const deleteTarget = ref<Role | null>(null)
  const resetTarget = ref<Role | null>(null)

  async function load(): Promise<void> {
    loading.value = true
    try {
      const [rolesData, catalogData] = await Promise.all([fetchRoles(), fetchPermissionCatalog()])
      roles.value = rolesData
      catalog.value = catalogData
    } finally {
      loading.value = false
    }
  }

  function openCreate(): void {
    editing.value = null
    formOpen.value = true
  }
  function openEdit(role: Role): void {
    editing.value = role
    formOpen.value = true
  }

  /** Create or update; throws on failure so the form can map field errors. */
  async function submit(form: RoleForm): Promise<void> {
    if (editing.value) {
      const payload: RoleUpdateForm = { name: form.name, permissions: form.permissions }
      // A system role's type is fixed — the backend rejects a change anyway.
      if (!editing.value.isSystem) payload.baseRole = form.baseRole
      await updateRole(editing.value.id, payload)
    } else {
      await createRole(form)
    }
    notify.success(t('common.saved'))
    formOpen.value = false
    await load()
  }

  function requestDelete(role: Role): void {
    deleteTarget.value = role
  }
  async function confirmDelete(): Promise<void> {
    if (!deleteTarget.value) return
    await deleteRole(deleteTarget.value.id)
    notify.success(t('common.deleted'))
    deleteTarget.value = null
    await load()
  }

  function requestReset(role: Role): void {
    resetTarget.value = role
  }
  /** System role → its preset (the default the center started with). */
  async function confirmReset(): Promise<void> {
    if (!resetTarget.value) return
    await resetRole(resetTarget.value.id)
    notify.success(t('roles.reset.done'))
    resetTarget.value = null
    await load()
  }

  return {
    roles, catalog, loading,
    formOpen, editing, deleteTarget, resetTarget,
    load, openCreate, openEdit, submit, requestDelete, confirmDelete, requestReset, confirmReset,
  }
}
