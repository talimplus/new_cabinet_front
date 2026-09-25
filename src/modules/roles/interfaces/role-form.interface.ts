import type { UserRole } from '@/shared/enums/user-role.enum'

/** POST /roles body — `name`, `baseRole` and `permissions` are required. */
export interface RoleForm {
  name: string
  baseRole: UserRole
  permissions: string[]
  /** Optional slug; the backend derives one from `name` when omitted. */
  key?: string
}

/** PUT /roles/{id} body — every field optional; a system role keeps its type. */
export interface RoleUpdateForm {
  name?: string
  baseRole?: UserRole
  permissions?: string[]
}
