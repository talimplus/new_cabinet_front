import type { UserRole } from '@/shared/enums/user-role.enum'

/**
 * `GET /users/me` — the signed-in user's own profile (verified against the live
 * endpoint 2026-09-24). `salary` / `commissionPercentage` are teacher-only and
 * come back `null` for everyone else. `role` is the base role type; `roleName`
 * is the admin-chosen display name.
 */
export interface Profile {
  id: number
  firstName: string
  lastName: string
  login: string
  phone: string
  role: UserRole
  roleName: string | null
  salary: number | null
  commissionPercentage: number | null
}

/** `PUT /users/me` body. `password` is omitted when the user leaves it blank. */
export interface ProfileForm {
  firstName: string
  lastName: string
  login: string
  phone: string
  password?: string
}
