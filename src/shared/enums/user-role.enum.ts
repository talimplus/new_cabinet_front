/**
 * Backend **base role type** strings — must match exactly
 * (`docs/03-roles-permissions.md` §1).
 *
 * ⚠️ This is NOT authorization. It only drives the few business rules that
 * genuinely depend on the type of person (teacher owns groups and earns a
 * commission, the owner never fines themself). Everything else gates on
 * `Permission` keys.
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  RECEPTION = 'reception',
  TEACHER = 'teacher',
  OTHER = 'other',
  STUDENT = 'student',
}

/** i18n key per base role — the fallback label when a role has no custom name. */
export const USER_ROLE_LABEL_KEYS: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'users.roles.super_admin',
  [UserRole.ADMIN]: 'users.roles.admin',
  [UserRole.MANAGER]: 'users.roles.manager',
  [UserRole.RECEPTION]: 'users.roles.reception',
  [UserRole.TEACHER]: 'users.roles.teacher',
  [UserRole.OTHER]: 'users.roles.other',
  [UserRole.STUDENT]: 'users.roles.student',
}
