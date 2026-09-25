import { Permission } from '@/shared/enums/permission.enum'
import { hasPermission } from './can'

/**
 * Where a signed-in user lands: the first page they actually have a key for
 * (`docs/03-roles-permissions.md` §5). Order matters — an admin gets the
 * dashboard, a teacher "today", reception the student list.
 *
 * The last entry must stay **ungated**, otherwise the guard would bounce a
 * low-permission user in a loop.
 */
const HOME_ROUTES: Array<{ path: string; permission: Permission[] }> = [
  { path: '/', permission: [Permission.STATISTICS_VIEW] },
  { path: '/today', permission: [Permission.TEACHER_TODAY] },
  { path: '/groups', permission: [Permission.GROUPS_VIEW] },
  { path: '/students', permission: [Permission.STUDENTS_VIEW] },
  { path: '/leads', permission: [Permission.LEADS_VIEW] },
  { path: '/payments', permission: [Permission.PAYMENTS_VIEW] },
  { path: '/syllabuses', permission: [Permission.SYLLABUS_VIEW] },
  { path: '/profile', permission: [] },
]

export function resolveHome(permissions: string[]): string {
  const match = HOME_ROUTES.find((route) => hasPermission(permissions, route.permission))
  return match?.path ?? '/profile'
}
