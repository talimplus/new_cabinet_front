import { Permission } from '@/shared/enums/permission.enum'

/**
 * Endpoint → permission table, ported from `docs/03-roles-permissions.md` §4
 * (generated in the old repo from the backend's `@RequirePermissions(...)`).
 *
 * The request interceptor matches every outgoing call against this table and
 * **drops** calls the user has no key for, so a restricted user never fires a
 * request that can only come back 403. Hiding the UI is still required — this
 * only silences the noise (`docs/03-roles-permissions.md` §8).
 *
 * Rules:
 * - `permissions: []` means the endpoint is open to any authenticated user. Such
 *   rows must stay in the table: they stop a parametrised rule from swallowing a
 *   static one (`/centers/all` is open, `/centers/:id` is not).
 * - Several keys on one rule mean **OR** — any one suffices.
 * - A path with no rule is treated as open.
 */
export interface ApiPermissionRule {
  method: HttpMethod
  /** Path template; `:param` matches exactly one segment. */
  path: string
  permissions: Permission[]
  /** The endpoint accepts a `centerId` query param (⊕ in the doc). */
  acceptsCenterId?: boolean
}

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  DELETE = 'DELETE',
}

const { GET, POST, PUT, DELETE } = HttpMethod

export const API_PERMISSIONS: ApiPermissionRule[] = [
  // ---- auth / organization (open) ----
  { method: POST, path: '/auth/login', permissions: [] },
  { method: POST, path: '/auth/logout', permissions: [] },
  { method: POST, path: '/auth/register', permissions: [] },
  { method: GET, path: '/auth/me', permissions: [] },
  { method: GET, path: '/organizations/branding', permissions: [] },
  { method: PUT, path: '/organizations/branding', permissions: [Permission.ORGANIZATION_SETTINGS] },
  { method: GET, path: '/organizations/:id', permissions: [] },
  { method: GET, path: '/subscriptions/organization/:id', permissions: [] },

  // ---- users ----
  { method: GET, path: '/users/me', permissions: [] },
  { method: PUT, path: '/users/me', permissions: [] },
  {
    method: GET,
    path: '/users/employees',
    permissions: [Permission.USERS_VIEW, Permission.GROUPS_CREATE, Permission.GROUPS_UPDATE],
    acceptsCenterId: true,
  },
  {
    method: GET,
    path: '/users/teachers',
    permissions: [Permission.USERS_VIEW, Permission.GROUPS_VIEW, Permission.STUDENTS_VIEW],
    acceptsCenterId: true,
  },
  { method: GET, path: '/users/email/:email', permissions: [Permission.USERS_VIEW] },
  { method: GET, path: '/users', permissions: [Permission.USERS_VIEW], acceptsCenterId: true },
  { method: POST, path: '/users', permissions: [Permission.USERS_CREATE] },
  { method: PUT, path: '/users/:id/active', permissions: [Permission.USERS_UPDATE] },
  { method: GET, path: '/users/:id', permissions: [Permission.USERS_VIEW] },
  { method: PUT, path: '/users/:id', permissions: [Permission.USERS_UPDATE] },
  { method: DELETE, path: '/users/:id', permissions: [Permission.USERS_DELETE] },

  // ---- roles ----
  { method: GET, path: '/roles/permissions', permissions: [Permission.ROLES_VIEW] },
  { method: GET, path: '/roles', permissions: [Permission.ROLES_VIEW] },
  { method: POST, path: '/roles', permissions: [Permission.ROLES_MANAGE] },
  { method: PUT, path: '/roles/:id', permissions: [Permission.ROLES_MANAGE] },
  { method: DELETE, path: '/roles/:id', permissions: [Permission.ROLES_MANAGE] },

  // ---- centers ----
  { method: GET, path: '/centers/all', permissions: [] },
  { method: GET, path: '/centers', permissions: [Permission.CENTERS_VIEW] },
  { method: GET, path: '/centers/:id', permissions: [Permission.CENTERS_VIEW] },
  { method: POST, path: '/centers', permissions: [Permission.CENTERS_MANAGE] },
  { method: PUT, path: '/centers/:id', permissions: [Permission.CENTERS_MANAGE] },
  { method: DELETE, path: '/centers/:id', permissions: [Permission.CENTERS_MANAGE] },
  { method: POST, path: '/centers/:id/capture-ip', permissions: [Permission.CENTERS_MANAGE] },

  // ---- students ----
  { method: GET, path: '/students/all', permissions: [Permission.STUDENTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/students/referrals', permissions: [Permission.STUDENTS_VIEW] },
  { method: POST, path: '/students/transfer/preview', permissions: [Permission.STUDENTS_TRANSFER] },
  { method: POST, path: '/students/transfer', permissions: [Permission.STUDENTS_TRANSFER] },
  { method: PUT, path: '/students/change-status/:id', permissions: [Permission.STUDENTS_CHANGE_STATUS] },
  { method: GET, path: '/students/:id/discount-periods', permissions: [Permission.STUDENTS_DISCOUNTS] },
  { method: POST, path: '/students/:id/discount-periods', permissions: [Permission.STUDENTS_DISCOUNTS] },
  { method: PUT, path: '/students/:id/discount-periods/:periodId', permissions: [Permission.STUDENTS_DISCOUNTS] },
  { method: DELETE, path: '/students/:id/discount-periods/:periodId', permissions: [Permission.STUDENTS_DISCOUNTS] },
  { method: GET, path: '/students', permissions: [Permission.STUDENTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/student', permissions: [Permission.STUDENTS_VIEW], acceptsCenterId: true },
  { method: POST, path: '/students', permissions: [Permission.STUDENTS_CREATE] },
  { method: GET, path: '/students/:id', permissions: [Permission.STUDENTS_VIEW] },
  { method: PUT, path: '/students/:id', permissions: [Permission.STUDENTS_UPDATE] },
  { method: DELETE, path: '/students/:id', permissions: [Permission.STUDENTS_DELETE] },

  // ---- bayram kunlari ----
  {
    method: GET,
    path: '/holidays',
    permissions: [Permission.SCHEDULE_VIEW, Permission.GROUPS_VIEW, Permission.ATTENDANCE_VIEW],
    acceptsCenterId: true,
  },
  { method: POST, path: '/holidays', permissions: [Permission.SCHEDULE_MANAGE] },
  { method: DELETE, path: '/holidays/:id', permissions: [Permission.SCHEDULE_MANAGE] },

  // ---- attendance: kelmaganlar ro'yxati ----
  { method: GET, path: '/attendance/absences', permissions: [Permission.ATTENDANCE_VIEW], acceptsCenterId: true },
  { method: PUT, path: '/attendance/absences/:id/follow-up', permissions: [Permission.ATTENDANCE_MANAGE] },

  // ---- groups ----
  { method: GET, path: '/groups/all', permissions: [Permission.GROUPS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/groups/:id/pauses', permissions: [Permission.GROUPS_VIEW] },
  { method: POST, path: '/groups/:id/pauses', permissions: [Permission.GROUPS_UPDATE] },
  { method: DELETE, path: '/groups/:id/pauses/:pauseId', permissions: [Permission.GROUPS_UPDATE] },
  { method: GET, path: '/group/all', permissions: [Permission.GROUPS_VIEW], acceptsCenterId: true },
  { method: PUT, path: '/groups/change-status/:id', permissions: [Permission.GROUPS_CHANGE_STATUS] },
  { method: GET, path: '/groups/:groupId/attendance/lesson-dates', permissions: [Permission.ATTENDANCE_VIEW] },
  { method: GET, path: '/groups/:groupId/attendance', permissions: [Permission.ATTENDANCE_VIEW] },
  { method: POST, path: '/groups/:groupId/attendance/submit', permissions: [Permission.ATTENDANCE_MANAGE] },
  { method: POST, path: '/groups/:groupId/attendance/reschedule', permissions: [Permission.ATTENDANCE_MANAGE] },
  { method: PUT, path: '/groups/:groupId/plan/syllabus', permissions: [Permission.GROUP_PLAN_ATTACH] },
  { method: PUT, path: '/groups/:groupId/plan/lessons/:lessonNumber/topics', permissions: [Permission.GROUP_PLAN_MANAGE] },
  { method: POST, path: '/groups/:groupId/plan/distribute', permissions: [Permission.GROUP_PLAN_MANAGE] },
  { method: GET, path: '/groups/:groupId/plan', permissions: [Permission.GROUP_PLAN_VIEW] },
  { method: GET, path: '/groups', permissions: [Permission.GROUPS_VIEW], acceptsCenterId: true },
  { method: POST, path: '/groups', permissions: [Permission.GROUPS_CREATE] },
  { method: GET, path: '/groups/:id', permissions: [Permission.GROUPS_VIEW] },
  { method: PUT, path: '/groups/:id', permissions: [Permission.GROUPS_UPDATE] },
  { method: DELETE, path: '/groups/:id', permissions: [Permission.GROUPS_DELETE] },

  // ---- schedule ----
  { method: GET, path: '/group-schedule/board', permissions: [Permission.SCHEDULE_VIEW], acceptsCenterId: true },
  {
    method: POST,
    path: '/group-schedule/conflicts',
    permissions: [Permission.SCHEDULE_VIEW, Permission.GROUPS_CREATE, Permission.GROUPS_UPDATE],
  },
  { method: GET, path: '/group-schedule', permissions: [Permission.SCHEDULE_VIEW] },
  { method: GET, path: '/group-schedule/:id', permissions: [Permission.SCHEDULE_VIEW] },
  { method: POST, path: '/group-schedule', permissions: [Permission.SCHEDULE_MANAGE] },
  { method: PUT, path: '/group-schedule/:id', permissions: [Permission.SCHEDULE_MANAGE] },
  { method: DELETE, path: '/group-schedule/:id', permissions: [Permission.SCHEDULE_MANAGE] },

  // ---- leads ----
  { method: PUT, path: '/leads/change-status/:id', permissions: [Permission.LEADS_UPDATE] },
  { method: POST, path: '/leads/:id/transfer-to-student', permissions: [Permission.LEADS_TRANSFER] },
  { method: GET, path: '/leads', permissions: [Permission.LEADS_VIEW], acceptsCenterId: true },
  { method: POST, path: '/leads', permissions: [Permission.LEADS_CREATE] },
  { method: PUT, path: '/leads/:id', permissions: [Permission.LEADS_UPDATE] },
  { method: DELETE, path: '/leads/:id', permissions: [Permission.LEADS_DELETE] },

  // ---- payments ----
  { method: GET, path: '/payments/export', permissions: [Permission.PAYMENTS_EXPORT], acceptsCenterId: true },
  { method: GET, path: '/payments/pending-receipts', permissions: [Permission.RECEIPTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/payments/receipts-stats', permissions: [Permission.RECEIPTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/payments/receipt/:receiptId/check', permissions: [Permission.PAYMENTS_VIEW] },
  { method: GET, path: '/payments/student/:studentId/summary', permissions: [Permission.PAYMENTS_VIEW] },
  { method: GET, path: '/payments/:paymentId/receipts', permissions: [Permission.PAYMENTS_VIEW] },
  { method: PUT, path: '/payments/mark-as-paid/:id', permissions: [Permission.PAYMENTS_CREATE] },
  { method: PUT, path: '/payments/pay-partial/:id', permissions: [Permission.PAYMENTS_CREATE] },
  { method: PUT, path: '/payments/pay-debt/student/:studentId', permissions: [Permission.PAYMENTS_CREATE] },
  { method: PUT, path: '/payments/calculate/:id', permissions: [Permission.PAYMENTS_RECALCULATE] },
  { method: PUT, path: '/payments/preview-exclusion/:id', permissions: [Permission.PAYMENTS_EXCLUSION] },
  { method: PUT, path: '/payments/apply-exclusion/:id', permissions: [Permission.PAYMENTS_EXCLUSION] },
  { method: PUT, path: '/payments/confirm-receipts', permissions: [Permission.RECEIPTS_CONFIRM] },
  { method: PUT, path: '/payments/confirm-receipt/:id', permissions: [Permission.RECEIPTS_CONFIRM] },
  { method: PUT, path: '/payments/reject-receipt/:id', permissions: [Permission.RECEIPTS_REJECT] },
  { method: GET, path: '/payments', permissions: [Permission.PAYMENTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/payments/:id', permissions: [Permission.PAYMENTS_VIEW] },
  { method: PUT, path: '/payments/:id', permissions: [Permission.PAYMENTS_UPDATE] },

  // ---- expenses ----
  { method: GET, path: '/expenses', permissions: [Permission.EXPENSES_VIEW], acceptsCenterId: true },
  { method: POST, path: '/expenses', permissions: [Permission.EXPENSES_CREATE] },
  { method: GET, path: '/expenses/:id', permissions: [Permission.EXPENSES_VIEW] },
  { method: PUT, path: '/expenses/:id', permissions: [Permission.EXPENSES_UPDATE] },
  { method: DELETE, path: '/expenses/:id', permissions: [Permission.EXPENSES_DELETE] },

  // ---- payroll / staff ----
  { method: GET, path: '/staff-salaries', permissions: [Permission.PAYROLL_VIEW], acceptsCenterId: true },
  { method: PUT, path: '/staff-salaries/pay/:id', permissions: [Permission.PAYROLL_PAY] },
  { method: POST, path: '/staff/deductions', permissions: [Permission.PAYROLL_DEDUCT] },
  { method: DELETE, path: '/staff/deductions/:id', permissions: [Permission.PAYROLL_DEDUCT] },
  { method: GET, path: '/staff/me/overview', permissions: [Permission.STAFF_ATTENDANCE_VIEW_OWN] },
  {
    method: GET,
    path: '/staff/:userId/overview',
    permissions: [Permission.STAFF_PERFORMANCE_VIEW, Permission.STAFF_ATTENDANCE_VIEW_OWN],
  },
  { method: GET, path: '/staff/:userId/deductions', permissions: [Permission.STAFF_PERFORMANCE_VIEW] },

  // ---- staff attendance ----
  { method: POST, path: '/staff-attendance/check-in', permissions: [Permission.STAFF_ATTENDANCE_CHECK_IN] },
  { method: GET, path: '/staff-attendance/me/today', permissions: [Permission.STAFF_ATTENDANCE_VIEW_OWN] },
  { method: GET, path: '/staff-attendance/me', permissions: [Permission.STAFF_ATTENDANCE_VIEW_OWN], acceptsCenterId: true },
  { method: GET, path: '/staff-attendance/report', permissions: [Permission.STAFF_ATTENDANCE_VIEW], acceptsCenterId: true },
  { method: POST, path: '/staff-attendance/manual', permissions: [Permission.STAFF_ATTENDANCE_MANAGE] },
  { method: POST, path: '/staff-attendance/:id/confirm', permissions: [Permission.STAFF_ATTENDANCE_MANAGE] },
  { method: DELETE, path: '/staff-attendance/:id', permissions: [Permission.STAFF_ATTENDANCE_MANAGE] },
  { method: GET, path: '/staff-attendance', permissions: [Permission.STAFF_ATTENDANCE_VIEW], acceptsCenterId: true },

  // ---- subjects / rooms ----
  // No `/subjects/all`: the backend never had one — subject option lists use
  // `/subjects` with a large perPage (same as the old app's fetchAllSubjects).
  { method: GET, path: '/subjects', permissions: [Permission.SUBJECTS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/subjects/:id', permissions: [Permission.SUBJECTS_VIEW] },
  { method: POST, path: '/subjects', permissions: [Permission.SUBJECTS_MANAGE] },
  { method: PUT, path: '/subjects/:id', permissions: [Permission.SUBJECTS_MANAGE] },
  { method: DELETE, path: '/subjects/:id', permissions: [Permission.SUBJECTS_MANAGE] },
  { method: GET, path: '/rooms', permissions: [Permission.ROOMS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/rooms/:id', permissions: [Permission.ROOMS_VIEW] },
  { method: POST, path: '/rooms', permissions: [Permission.ROOMS_MANAGE] },
  { method: PUT, path: '/rooms/:id', permissions: [Permission.ROOMS_MANAGE] },
  { method: DELETE, path: '/rooms/:id', permissions: [Permission.ROOMS_MANAGE] },

  // ---- statistics ----
  { method: GET, path: '/statistics/dashboard', permissions: [Permission.STATISTICS_VIEW], acceptsCenterId: true },

  // ---- syllabuses ----
  { method: POST, path: '/syllabuses/ai/chat', permissions: [Permission.SYLLABUS_AI] },
  { method: POST, path: '/syllabuses/ai/save', permissions: [Permission.SYLLABUS_AI] },
  {
    method: POST,
    path: '/syllabuses/:id/topics/:topicId/generate-content',
    permissions: [Permission.SYLLABUS_AI],
  },
  { method: PUT, path: '/syllabuses/:id/topics/reorder', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: POST, path: '/syllabuses/:id/topics', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: PUT, path: '/syllabuses/:id/topics/:topicId', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: DELETE, path: '/syllabuses/:id/topics/:topicId', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: GET, path: '/syllabuses', permissions: [Permission.SYLLABUS_VIEW], acceptsCenterId: true },
  { method: GET, path: '/syllabuses/:id', permissions: [Permission.SYLLABUS_VIEW] },
  { method: POST, path: '/syllabuses', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: PUT, path: '/syllabuses/:id', permissions: [Permission.SYLLABUS_MANAGE] },
  { method: DELETE, path: '/syllabuses/:id', permissions: [Permission.SYLLABUS_MANAGE] },

  // ---- teacher cabinet ----
  { method: GET, path: '/teachers/me/today', permissions: [Permission.TEACHER_TODAY], acceptsCenterId: true },

  // ---- telegram ----
  { method: GET, path: '/telegram/students/:studentId/link', permissions: [Permission.STUDENTS_VIEW] },
  { method: POST, path: '/telegram/students/:studentId/link/regenerate', permissions: [Permission.STUDENTS_UPDATE] },
  { method: DELETE, path: '/telegram/parents/:linkId', permissions: [Permission.STUDENTS_UPDATE] },
  { method: GET, path: '/telegram/settings', permissions: [Permission.TELEGRAM_SETTINGS] },
  { method: PUT, path: '/telegram/settings', permissions: [Permission.TELEGRAM_SETTINGS] },
  { method: PUT, path: '/telegram/bot-token', permissions: [Permission.TELEGRAM_SETTINGS] },
  { method: DELETE, path: '/telegram/bot-token', permissions: [Permission.TELEGRAM_SETTINGS] },
  { method: POST, path: '/telegram/debt-reminders/send-now', permissions: [Permission.TELEGRAM_SETTINGS] },
]
