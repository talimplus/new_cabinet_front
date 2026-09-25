import { UserRole } from '@/shared/enums/user-role.enum'

/**
 * The base role types an admin may assign when creating a role — `admin` is
 * never assignable (the locked Administrator is seeded once per organization)
 * and `super_admin` / `student` are not org-level staff types.
 */
export const ASSIGNABLE_BASE_ROLES: UserRole[] = [
  UserRole.TEACHER,
  UserRole.MANAGER,
  UserRole.RECEPTION,
  UserRole.OTHER,
]

/** i18n key for a base role type; falls back to the raw value when unknown. */
export function baseRoleLabelKey(baseRole: string): string {
  return `roles.baseRoles.${baseRole}`
}
