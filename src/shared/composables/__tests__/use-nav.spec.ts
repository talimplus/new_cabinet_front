import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useNav } from '../use-nav'
import { useUserStore } from '@/stores/user.store'
import { UserRole } from '@/shared/enums/user-role.enum'
import { Permission, ALL_PERMISSIONS } from '@/shared/enums/permission.enum'
import { navigation } from '@/shared/config/navigation'

/** The default teacher set from docs/03-roles-permissions.md §3. */
const TEACHER_KEYS: string[] = [
  Permission.TEACHER_TODAY,
  Permission.GROUPS_VIEW,
  Permission.STUDENTS_VIEW,
  Permission.ATTENDANCE_VIEW,
  Permission.ATTENDANCE_MANAGE,
  Permission.ATTENDANCE_MANAGE_PAST,
  Permission.SCHEDULE_VIEW,
  Permission.SYLLABUS_VIEW,
  Permission.GROUP_PLAN_VIEW,
  Permission.GROUP_PLAN_MANAGE,
  Permission.STAFF_ATTENDANCE_VIEW_OWN,
  Permission.STAFF_ATTENDANCE_CHECK_IN,
]

function seedUser(permissions: string[], role: UserRole = UserRole.ADMIN): void {
  useUserStore().user = {
    id: 1, email: 'a@b.uz', role, roleId: 1, roleName: 'Test', centerId: 1, permissions,
  }
}

/** Flattened list of visible `to` paths. */
function visiblePaths(): string[] {
  const { groups } = useNav()
  return groups.value.flatMap((g) => g.items.map((i) => i.to))
}

describe('useNav', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('shows nothing when there is no user (deny by default)', () => {
    expect(visiblePaths()).toEqual([])
  })

  it('shows every item for the wildcard permission', () => {
    // A manager, so no `hideForBaseRoles` item is hidden (that only affects admins).
    seedUser([ALL_PERMISSIONS], UserRole.MANAGER)
    const all = navigation.flatMap((g) => g.items.map((i) => i.to))
    expect(visiblePaths()).toEqual(all)
  })

  it('shows only what the granted keys open', () => {
    seedUser([Permission.PAYMENTS_VIEW, Permission.GROUPS_VIEW])
    const paths = visiblePaths()
    expect(paths).toEqual(['/groups', '/payments'])
  })

  it('gives a teacher their pages and withholds the admin-only ones', () => {
    seedUser(TEACHER_KEYS, UserRole.TEACHER)
    const paths = visiblePaths()
    expect(paths).toContain('/today')
    expect(paths).toContain('/groups')
    expect(paths).toContain('/syllabuses')
    expect(paths).not.toContain('/users')
    expect(paths).not.toContain('/centers')
    expect(paths).not.toContain('/payments')
    expect(paths).not.toContain('/payroll')
  })

  it('hides "Bugungi darslar" (/today) without teacher.today', () => {
    seedUser([Permission.STATISTICS_VIEW, Permission.USERS_VIEW])
    expect(visiblePaths()).not.toContain('/today')
  })

  it('drops groups that become empty after filtering', () => {
    seedUser(TEACHER_KEYS, UserRole.TEACHER)
    const { groups } = useNav()
    expect(groups.value.every((g) => g.items.length > 0)).toBe(true)
  })

  it('honours hideForBaseRoles even when the key is held', () => {
    // /my-performance is hidden from an admin (they manage others, not themselves)…
    seedUser([ALL_PERMISSIONS], UserRole.ADMIN)
    expect(visiblePaths()).not.toContain('/my-performance')

    // …but a manager holding the same keys DOES see it.
    seedUser([ALL_PERMISSIONS], UserRole.MANAGER)
    expect(visiblePaths()).toContain('/my-performance')
  })
})
