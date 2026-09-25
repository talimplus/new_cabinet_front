import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, fetchMe as fetchMeApi, logout as logoutApi } from '@/modules/auth/api/auth.api'
import { TOKEN_KEY } from '@/shared/api/http'
import { hasPermission } from '@/shared/permissions/can'
import type { Permission } from '@/shared/enums/permission.enum'
import type { UserRole } from '@/shared/enums/user-role.enum'
import type { AuthUser } from '@/modules/auth/interfaces/auth.interface'
import type { LoginForm } from '@/modules/auth/interfaces/login-form.interface'

/**
 * Current authenticated user + session lifecycle. The JWT lives in
 * localStorage under `token` (the http interceptor reads it); this store holds
 * the user and is the **single source of authorization** via `can()`.
 *
 * Permissions are not in the token — they come from `/auth/me`, so an admin
 * editing a role takes effect on the employee's next rehydrate without a
 * re-login (`docs/03-roles-permissions.md` §1).
 */
export const useUserStore = defineStore('user', () => {
  const user = ref<AuthUser | null>(null)
  const isAuthenticated = computed(() => user.value !== null)

  const permissions = computed<string[]>(() => user.value?.permissions ?? [])
  const role = computed<UserRole | null>(() => user.value?.role ?? null)

  /** Several keys mean OR; `*` satisfies everything; no user → false. */
  function can(...keys: Permission[]): boolean {
    return hasPermission(permissions.value, keys)
  }

  async function login(form: LoginForm): Promise<AuthUser> {
    const { access_token, user: authUser } = await loginApi(form)
    localStorage.setItem(TOKEN_KEY, access_token)
    user.value = authUser
    return authUser
  }

  /** Rehydrate the user from the stored token (session bootstrap / guards). */
  async function fetchMe(): Promise<AuthUser> {
    const { user: authUser } = await fetchMeApi()
    user.value = authUser
    return authUser
  }

  async function logout(): Promise<void> {
    try {
      await logoutApi()
    } finally {
      localStorage.removeItem(TOKEN_KEY)
      user.value = null
      // Imported lazily: the scope store reads this one, so a top-level import
      // would be circular.
      const { useScopeStore } = await import('@/stores/scope.store')
      useScopeStore().reset()
      const { useBrandingStore } = await import('@/stores/branding.store')
      useBrandingStore().reset()
    }
  }

  return { user, isAuthenticated, permissions, role, can, login, fetchMe, logout }
})
