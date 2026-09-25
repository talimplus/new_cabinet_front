import { http } from '@/shared/api/http'
import type { Role } from '../interfaces/role.interface'
import type { PermissionGroup } from '../interfaces/permission-group.interface'
import type { RoleForm, RoleUpdateForm } from '../interfaces/role-form.interface'

/** Both list endpoints answer with a **bare array**, not `{ data, meta }`. */
export async function fetchRoles(): Promise<Role[]> {
  const { data } = await http.get<Role[]>('/roles')
  return data
}

export async function fetchPermissionCatalog(): Promise<PermissionGroup[]> {
  const { data } = await http.get<PermissionGroup[]>('/roles/permissions')
  return data
}

export async function createRole(form: RoleForm): Promise<Role> {
  const { data } = await http.post<Role>('/roles', form)
  return data
}

export async function updateRole(id: number, form: RoleUpdateForm): Promise<Role> {
  const { data } = await http.put<Role>(`/roles/${id}`, form)
  return data
}

export async function deleteRole(id: number): Promise<void> {
  await http.delete(`/roles/${id}`)
}
