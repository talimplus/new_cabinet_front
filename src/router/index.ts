import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { registerGuards } from './guards'
import { Permission } from '@/shared/enums/permission.enum'

/**
 * `meta.titleKey` is an i18n key, not a literal — the header translates it, so a
 * language switch re-titles every page without a reload.
 *
 * `meta.permission` is an OR list (`docs/03-roles-permissions.md` §5): holding
 * any one key opens the page. No `meta.permission` = open to any signed-in user.
 */
interface PageRoute {
  path: string
  name: string
  titleKey: string
  permission?: Permission[]
}

interface StudentPageRoute extends PageRoute {
  variant: string
}

/** Student pages — all rendered by the config-driven StudentsView, keyed by `variant`. */
const studentPages: StudentPageRoute[] = [
  { path: 'reception', name: 'reception', titleKey: 'layout.menu.reception', variant: 'reception' },
  { path: 'students', name: 'students', titleKey: 'layout.menu.students', variant: 'active' },
  { path: 'stopped', name: 'stopped', titleKey: 'layout.menu.stopped', variant: 'stopped' },
  { path: 'ignored', name: 'ignored', titleKey: 'layout.menu.ignored', variant: 'ignored' },
  { path: 'finished', name: 'finished', titleKey: 'layout.menu.finished', variant: 'finished' },
]

const appChildren: RouteRecordRaw[] = [
  {
    path: '',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: { titleKey: 'layout.menu.statistics', permission: [Permission.STATISTICS_VIEW] },
  },
  {
    // Open on purpose: any signed-in user edits their own profile; it is also the
    // resolved-home fallback, so it must always be reachable (no `permission`).
    path: 'profile',
    name: 'profile',
    component: () => import('@/modules/profile/views/ProfileView.vue'),
    meta: { titleKey: 'profile.title' },
  },
  {
    path: 'today',
    name: 'today',
    component: () => import('@/modules/today/views/TodayView.vue'),
    meta: { titleKey: 'layout.menu.todayLessons', permission: [Permission.TEACHER_TODAY] },
  },
  {
    path: 'centers',
    name: 'centers',
    component: () => import('@/modules/centers/views/CentersView.vue'),
    meta: { titleKey: 'layout.menu.centers', permission: [Permission.CENTERS_VIEW] },
  },
  {
    path: 'organization',
    name: 'organization',
    component: () => import('@/modules/organization/views/OrganizationView.vue'),
    meta: { titleKey: 'layout.menu.organization', permission: [Permission.ORGANIZATION_SETTINGS] },
  },
  {
    path: 'telegram',
    name: 'telegram',
    component: () => import('@/modules/telegram/views/TelegramSettingsView.vue'),
    meta: { titleKey: 'layout.menu.telegram', permission: [Permission.TELEGRAM_SETTINGS] },
  },
  {
    path: 'rooms',
    name: 'rooms',
    component: () => import('@/modules/rooms/views/RoomsView.vue'),
    meta: { titleKey: 'layout.menu.rooms', permission: [Permission.ROOMS_VIEW] },
  },
  {
    path: 'subjects',
    name: 'subjects',
    component: () => import('@/modules/subjects/views/SubjectsView.vue'),
    meta: { titleKey: 'layout.menu.subjects', permission: [Permission.SUBJECTS_VIEW] },
  },
  {
    path: 'groups',
    name: 'groups',
    component: () => import('@/modules/groups/views/GroupsView.vue'),
    meta: { titleKey: 'layout.menu.groups', permission: [Permission.GROUPS_VIEW] },
  },
  {
    path: 'groups/:id',
    name: 'group-detail',
    component: () => import('@/modules/groups/views/GroupDetailView.vue'),
    meta: { titleKey: 'layout.titles.group', permission: [Permission.GROUPS_VIEW] },
  },
  {
    path: 'schedule',
    name: 'schedule',
    component: () => import('@/modules/schedule/views/ScheduleView.vue'),
    meta: { titleKey: 'layout.menu.schedule', permission: [Permission.SCHEDULE_VIEW] },
  },
  {
    path: 'holidays',
    name: 'holidays',
    component: () => import('@/modules/holidays/views/HolidaysView.vue'),
    meta: { titleKey: 'layout.menu.holidays', permission: [Permission.SCHEDULE_VIEW] },
  },
  {
    path: 'absences',
    name: 'absences',
    component: () => import('@/modules/absences/views/AbsencesView.vue'),
    meta: { titleKey: 'layout.menu.absences', permission: [Permission.ATTENDANCE_VIEW] },
  },
  {
    path: 'staff-attendance',
    name: 'staff-attendance',
    component: () => import('@/modules/staff-attendance/views/StaffAttendanceView.vue'),
    meta: { titleKey: 'layout.menu.staffAttendance', permission: [Permission.STAFF_ATTENDANCE_VIEW] },
  },
  {
    path: 'syllabuses',
    name: 'syllabuses',
    component: () => import('@/modules/syllabuses/views/SyllabusesView.vue'),
    meta: { titleKey: 'layout.menu.syllabuses', permission: [Permission.SYLLABUS_VIEW] },
  },
  {
    path: 'syllabuses/:id',
    name: 'syllabus-detail',
    component: () => import('@/modules/syllabuses/views/SyllabusDetailView.vue'),
    meta: { titleKey: 'layout.titles.syllabus', permission: [Permission.SYLLABUS_VIEW] },
  },
  {
    path: 'roles',
    name: 'roles',
    component: () => import('@/modules/roles/views/RolesView.vue'),
    meta: { titleKey: 'layout.menu.roles', permission: [Permission.ROLES_VIEW] },
  },
  {
    path: 'users',
    name: 'users',
    component: () => import('@/modules/users/views/UsersView.vue'),
    meta: { titleKey: 'layout.menu.users', permission: [Permission.USERS_VIEW] },
  },
  {
    path: 'users/:id',
    name: 'staff-overview',
    component: () => import('@/modules/staff/views/StaffPerformanceView.vue'),
    meta: { titleKey: 'staff.title', permission: [Permission.STAFF_PERFORMANCE_VIEW] },
  },
  {
    path: 'my-performance',
    name: 'my-performance',
    component: () => import('@/modules/staff/views/StaffPerformanceView.vue'),
    meta: { titleKey: 'layout.menu.myPerformance', permission: [Permission.STAFF_ATTENDANCE_VIEW_OWN] },
  },
  {
    path: 'leads',
    name: 'leads',
    component: () => import('@/modules/leads/views/LeadsView.vue'),
    meta: { titleKey: 'layout.menu.leads', permission: [Permission.LEADS_VIEW] },
  },
  {
    path: 'payments',
    name: 'payments',
    component: () => import('@/modules/payments/views/PaymentsView.vue'),
    meta: { titleKey: 'layout.menu.payments', permission: [Permission.PAYMENTS_VIEW] },
  },
  {
    path: 'payroll',
    name: 'payroll',
    component: () => import('@/modules/payroll/views/PayrollView.vue'),
    meta: { titleKey: 'layout.menu.payroll', permission: [Permission.PAYROLL_VIEW] },
  },
  {
    path: 'expenses',
    name: 'expenses',
    component: () => import('@/modules/expenses/views/ExpensesView.vue'),
    meta: { titleKey: 'layout.menu.expenses', permission: [Permission.EXPENSES_VIEW] },
  },
  {
    path: 'pending-receipts',
    name: 'pending-receipts',
    component: () => import('@/modules/pending-receipts/views/PendingReceiptsView.vue'),
    meta: { titleKey: 'layout.menu.pendingReceipts', permission: [Permission.RECEIPTS_VIEW] },
  },
  ...studentPages.map((p) => ({
    path: p.path,
    name: p.name,
    component: () => import('@/modules/students/views/StudentsView.vue'),
    props: { variant: p.variant },
    meta: { titleKey: p.titleKey, permission: [Permission.STUDENTS_VIEW] },
  })),
  {
    path: 'students/:id',
    name: 'student-card',
    component: () => import('@/modules/students/views/StudentCardView.vue'),
    meta: { titleKey: 'students.view.title', permission: [Permission.STUDENTS_VIEW] },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@/shared/components/layout/AppLayout.vue'),
      meta: { requiresAuth: true },
      children: appChildren,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/views/LoginView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/views/RegisterView.vue'),
      meta: { guestOnly: true },
    },
    {
      path: '/ui-kit',
      name: 'ui-kit',
      component: () => import('@/modules/playground/views/UiKitView.vue'),
    },
  ],
})

registerGuards(router)

export default router
