import type { UserRole } from '@/shared/enums/user-role.enum'

/**
 * A role as `GET /roles` returns it (verified 2026-09-23).
 *
 * `permissions` is `['*']` only for the locked Administrator. `isLocked` roles
 * cannot be edited or deleted; `isSystem` roles cannot be deleted and cannot
 * change their `baseRole`; a role with `userCount > 0` cannot be deleted.
 */
export interface Role {
  id: number
  key: string
  name: string
  baseRole: UserRole
  permissions: string[]
  isSystem: boolean
  isLocked: boolean
  userCount: number
  createdAt: string
  updatedAt: string
}
