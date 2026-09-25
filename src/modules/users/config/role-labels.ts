import { UserRole } from '@/shared/enums/user-role.enum'

/** The label map lives beside the enum in `shared/` (the header needs it too). */
export { USER_ROLE_LABEL_KEYS as ROLE_LABEL_KEYS } from '@/shared/enums/user-role.enum'

/** Only these roles may be assigned through the employee form (matches the old app). */
export const ASSIGNABLE_ROLES: UserRole[] = [
  UserRole.MANAGER,
  UserRole.TEACHER,
  UserRole.RECEPTION,
]
