import type { UserRole } from '@/shared/enums/user-role.enum'

/**
 * `GET /auth/me` / `POST /auth/login` user (verified —
 * `docs/01-api-integration.md` §3.2–3.3).
 *
 * `permissions` is the authorization source; `["*"]` means everything.
 * `role` is only the base role type, `roleName` the admin-chosen display name.
 */
export interface AuthUser {
  id: number
  email: string
  role: UserRole
  roleId: number | null
  roleName: string | null
  centerId: number | null
  permissions: string[]
}

/** POST /auth/login response. */
export interface LoginResponse {
  access_token: string
  user: AuthUser
}

/** GET /auth/me response. */
export interface MeResponse {
  user: AuthUser
}
