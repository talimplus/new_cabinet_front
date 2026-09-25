import type { Component } from 'vue'
import type { Permission } from '@/shared/enums/permission.enum'
import type { UserRole } from '@/shared/enums/user-role.enum'

export interface NavItem {
  /** i18n key (e.g. `layout.menu.groups`) — never a literal label. */
  labelKey: string
  to: string
  icon: Component
  /**
   * OR list — holding any one key shows the item. Absent = always visible.
   * Mirrors the route's `meta.permission` (docs/03-roles-permissions.md §6).
   */
  permission?: Permission[]
  /**
   * Base-role types that never see this item even if they hold the key —
   * the handful of §7 business rules (e.g. the owner never fines themself).
   */
  hideForBaseRoles?: UserRole[]
}

export interface NavGroup {
  /** i18n key for the section heading. Omit for a flat standalone block. */
  labelKey?: string
  /** Small icon shown next to the section heading. */
  icon?: Component
  items: NavItem[]
}
