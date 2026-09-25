import type { Router } from 'vue-router'
import { useUserStore } from '@/stores/user.store'
import { TOKEN_KEY } from '@/shared/api/http'
import { resolveHome } from '@/shared/permissions/resolve-home'

/**
 * Auth + permission navigation guard
 * (`docs/01-api-integration.md` §3.3, `docs/03-roles-permissions.md` §5):
 *
 * 1. Token present but user not loaded → rehydrate via `/auth/me`.
 * 2. `requiresAuth` and no session → `/login`.
 * 3. `guestOnly` while signed in → the resolved home page.
 * 4. `meta.permission` the user lacks → the resolved home page (never a blank
 *    403 screen). The home page is always one the user can open, so this
 *    cannot loop.
 */
export function registerGuards(router: Router): void {
  router.beforeEach(async (to) => {
    const userStore = useUserStore()

    if (localStorage.getItem(TOKEN_KEY) && !userStore.isAuthenticated) {
      try {
        await userStore.fetchMe()
      } catch {
        localStorage.removeItem(TOKEN_KEY)
      }
    }

    if (to.meta.requiresAuth && !userStore.isAuthenticated) {
      return { name: 'login' }
    }

    const home = () => resolveHome(userStore.permissions)

    if (to.meta.guestOnly && userStore.isAuthenticated) {
      return home()
    }

    const required = to.meta.permission
    if (userStore.isAuthenticated && required?.length && !userStore.can(...required)) {
      const target = home()
      // Guard against a self-redirect if the home page itself were gated.
      return target === to.path ? false : target
    }

    return true
  })
}
