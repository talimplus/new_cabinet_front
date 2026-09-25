import { ALL_PERMISSIONS, type Permission } from '@/shared/enums/permission.enum'

/**
 * The one authorization check in the app. Several keys mean **OR** — holding any
 * one of them is enough (mirrors the backend's `PermissionsGuard`).
 *
 * - `['*']` (the locked Administrator role) satisfies everything.
 * - No required keys → open.
 * - No granted keys (user not loaded yet) → denied, so UI never flashes.
 */
export function hasPermission(granted: string[], required: Permission[]): boolean {
  if (required.length === 0) return true
  if (granted.includes(ALL_PERMISSIONS)) return true
  return required.some((key) => granted.includes(key))
}
