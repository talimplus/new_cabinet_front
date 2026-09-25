import {
  CalendarDays, LayoutDashboard, Users, Flag, BookOpen, CreditCard, Wallet,
  DollarSign, ReceiptText, ClipboardList, UserPlus, GraduationCap, Pause, Ban,
  CheckCheck, Coins, Building2, DoorOpen, Settings2, ShieldCheck, CalendarRange, UserCheck,
  TrendingUp, Palette, Send,
} from '@/shared/icons'
import { Permission } from '@/shared/enums/permission.enum'
import { UserRole } from '@/shared/enums/user-role.enum'
import type { NavGroup } from '@/shared/interfaces/nav-item.interface'

/**
 * Sidebar menu — mirrors the old cabinet_front layout: standalone items on top,
 * then three grouped sections (To‘lovlar / O‘quvchilar / Sozlamalar).
 *
 * Visibility is **permission-driven** (`docs/03-roles-permissions.md` §6), so a
 * custom role an admin creates gets the right menu with no code change.
 * `use-nav` filters the items and drops a section once it is empty.
 *
 * Labels are i18n keys — switching language relabels the menu without a reload.
 */
export const navigation: NavGroup[] = [
  {
    labelKey: 'layout.sections.main',
    items: [
      { labelKey: 'layout.menu.todayLessons', to: '/today', icon: CalendarDays, permission: [Permission.TEACHER_TODAY] },
      { labelKey: 'layout.menu.statistics', to: '/', icon: LayoutDashboard, permission: [Permission.STATISTICS_VIEW] },
      { labelKey: 'layout.menu.users', to: '/users', icon: Users, permission: [Permission.USERS_VIEW] },
      { labelKey: 'layout.menu.roles', to: '/roles', icon: ShieldCheck, permission: [Permission.ROLES_VIEW] },
      { labelKey: 'layout.menu.staffAttendance', to: '/staff-attendance', icon: UserCheck, permission: [Permission.STAFF_ATTENDANCE_VIEW] },
      {
        labelKey: 'layout.menu.myPerformance',
        to: '/my-performance',
        icon: TrendingUp,
        permission: [Permission.STAFF_ATTENDANCE_VIEW_OWN],
        // Owners manage others, not themselves — hidden from their menu.
        hideForBaseRoles: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
      },
      { labelKey: 'layout.menu.groups', to: '/groups', icon: Flag, permission: [Permission.GROUPS_VIEW] },
      { labelKey: 'layout.menu.schedule', to: '/schedule', icon: CalendarRange, permission: [Permission.SCHEDULE_VIEW] },
      { labelKey: 'layout.menu.syllabuses', to: '/syllabuses', icon: BookOpen, permission: [Permission.SYLLABUS_VIEW] },
    ],
  },
  {
    labelKey: 'layout.sections.payments',
    icon: Coins,
    items: [
      { labelKey: 'layout.menu.payments', to: '/payments', icon: CreditCard, permission: [Permission.PAYMENTS_VIEW] },
      { labelKey: 'layout.menu.payroll', to: '/payroll', icon: Wallet, permission: [Permission.PAYROLL_VIEW] },
      { labelKey: 'layout.menu.expenses', to: '/expenses', icon: DollarSign, permission: [Permission.EXPENSES_VIEW] },
      { labelKey: 'layout.menu.pendingReceipts', to: '/pending-receipts', icon: ReceiptText, permission: [Permission.RECEIPTS_VIEW] },
    ],
  },
  {
    labelKey: 'layout.sections.students',
    icon: GraduationCap,
    items: [
      { labelKey: 'layout.menu.reception', to: '/reception', icon: ClipboardList, permission: [Permission.STUDENTS_VIEW] },
      { labelKey: 'layout.menu.leads', to: '/leads', icon: UserPlus, permission: [Permission.LEADS_VIEW] },
      { labelKey: 'layout.menu.students', to: '/students', icon: GraduationCap, permission: [Permission.STUDENTS_VIEW] },
      { labelKey: 'layout.menu.stopped', to: '/stopped', icon: Pause, permission: [Permission.STUDENTS_VIEW] },
      { labelKey: 'layout.menu.ignored', to: '/ignored', icon: Ban, permission: [Permission.STUDENTS_VIEW] },
      { labelKey: 'layout.menu.finished', to: '/finished', icon: CheckCheck, permission: [Permission.STUDENTS_VIEW] },
    ],
  },
  {
    labelKey: 'layout.sections.settings',
    icon: Settings2,
    items: [
      { labelKey: 'layout.menu.centers', to: '/centers', icon: Building2, permission: [Permission.CENTERS_VIEW] },
      { labelKey: 'layout.menu.subjects', to: '/subjects', icon: BookOpen, permission: [Permission.SUBJECTS_VIEW] },
      { labelKey: 'layout.menu.rooms', to: '/rooms', icon: DoorOpen, permission: [Permission.ROOMS_VIEW] },
      { labelKey: 'layout.menu.organization', to: '/organization', icon: Palette, permission: [Permission.ORGANIZATION_SETTINGS] },
      { labelKey: 'layout.menu.telegram', to: '/telegram', icon: Send, permission: [Permission.TELEGRAM_SETTINGS] },
    ],
  },
]
