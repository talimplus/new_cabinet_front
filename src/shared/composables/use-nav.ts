import { computed } from 'vue'
import { navigation } from '@/shared/config/navigation'
import { useUserStore } from '@/stores/user.store'
import type { NavGroup, NavItem } from '@/shared/interfaces/nav-item.interface'

/**
 * The navigation filtered for the current user. Visibility is decided by
 * **permission keys** — there is no role blacklist any more, so a role an admin
 * invents gets the correct menu automatically
 * (`docs/03-roles-permissions.md` §6). Empty sections are dropped.
 */
export function useNav() {
  const userStore = useUserStore()

  function isVisible(item: NavItem): boolean {
    const role = userStore.role
    if (item.hideForBaseRoles && role && item.hideForBaseRoles.includes(role)) return false
    if (!item.permission?.length) return true
    return userStore.can(...item.permission)
  }

  const groups = computed<NavGroup[]>(() =>
    navigation
      .map((group) => ({ ...group, items: group.items.filter(isVisible) }))
      .filter((group) => group.items.length > 0),
  )

  return { groups }
}
