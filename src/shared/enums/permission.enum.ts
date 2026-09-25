/**
 * Every permission key the backend catalog defines (18 groups / 67 keys),
 * verified against `GET /roles/permissions` — see `docs/03-roles-permissions.md` §2.
 *
 * Authorization is **key-based, never role-based**: an admin can invent a role
 * ("Kassir") and tick keys, and the UI must follow with no code change.
 */
export enum Permission {
  // dashboard
  STATISTICS_VIEW = 'statistics.view',

  // users
  USERS_VIEW = 'users.view',
  USERS_CREATE = 'users.create',
  USERS_UPDATE = 'users.update',
  USERS_DELETE = 'users.delete',

  // roles
  ROLES_VIEW = 'roles.view',
  ROLES_MANAGE = 'roles.manage',

  // students
  STUDENTS_VIEW = 'students.view',
  STUDENTS_CREATE = 'students.create',
  STUDENTS_UPDATE = 'students.update',
  STUDENTS_DELETE = 'students.delete',
  STUDENTS_CHANGE_STATUS = 'students.changeStatus',
  STUDENTS_DISCOUNTS = 'students.discounts',
  STUDENTS_TRANSFER = 'students.transfer',

  // leads
  LEADS_VIEW = 'leads.view',
  LEADS_CREATE = 'leads.create',
  LEADS_UPDATE = 'leads.update',
  LEADS_DELETE = 'leads.delete',
  LEADS_TRANSFER = 'leads.transfer',

  // groups
  GROUPS_VIEW = 'groups.view',
  GROUPS_CREATE = 'groups.create',
  GROUPS_UPDATE = 'groups.update',
  GROUPS_DELETE = 'groups.delete',
  GROUPS_CHANGE_STATUS = 'groups.changeStatus',

  // attendance
  ATTENDANCE_VIEW = 'attendance.view',
  ATTENDANCE_MANAGE = 'attendance.manage',
  ATTENDANCE_MANAGE_PAST = 'attendance.managePast',

  // schedule
  SCHEDULE_VIEW = 'schedule.view',
  SCHEDULE_MANAGE = 'schedule.manage',

  // syllabus
  SYLLABUS_VIEW = 'syllabus.view',
  SYLLABUS_MANAGE = 'syllabus.manage',
  SYLLABUS_AI = 'syllabus.ai',
  GROUP_PLAN_VIEW = 'groupPlan.view',
  GROUP_PLAN_MANAGE = 'groupPlan.manage',
  GROUP_PLAN_ATTACH = 'groupPlan.attach',

  // payments
  PAYMENTS_VIEW = 'payments.view',
  PAYMENTS_CREATE = 'payments.create',
  PAYMENTS_UPDATE = 'payments.update',
  PAYMENTS_DELETE = 'payments.delete',
  PAYMENTS_EXPORT = 'payments.export',
  PAYMENTS_RECALCULATE = 'payments.recalculate',
  PAYMENTS_EXCLUSION = 'payments.exclusion',

  // receipts
  RECEIPTS_VIEW = 'receipts.view',
  RECEIPTS_CONFIRM = 'receipts.confirm',
  RECEIPTS_REJECT = 'receipts.reject',

  // payroll
  PAYROLL_VIEW = 'payroll.view',
  PAYROLL_PAY = 'payroll.pay',
  PAYROLL_DEDUCT = 'payroll.deduct',
  PAYROLL_CALCULATE = 'payroll.calculate',

  // expenses
  EXPENSES_VIEW = 'expenses.view',
  EXPENSES_CREATE = 'expenses.create',
  EXPENSES_UPDATE = 'expenses.update',
  EXPENSES_DELETE = 'expenses.delete',

  // settings
  ORGANIZATION_SETTINGS = 'organization.settings',
  CENTERS_VIEW = 'centers.view',
  CENTERS_MANAGE = 'centers.manage',
  ROOMS_VIEW = 'rooms.view',
  ROOMS_MANAGE = 'rooms.manage',
  SUBJECTS_VIEW = 'subjects.view',
  SUBJECTS_MANAGE = 'subjects.manage',

  // telegram
  TELEGRAM_SETTINGS = 'telegram.settings',

  // staff performance
  STAFF_PERFORMANCE_VIEW = 'staffPerformance.view',

  // staff attendance
  STAFF_ATTENDANCE_CHECK_IN = 'staffAttendance.checkIn',
  STAFF_ATTENDANCE_VIEW_OWN = 'staffAttendance.viewOwn',
  STAFF_ATTENDANCE_VIEW = 'staffAttendance.view',
  STAFF_ATTENDANCE_MANAGE = 'staffAttendance.manage',

  // teacher cabinet
  TEACHER_TODAY = 'teacher.today',
}

/** The wildcard the locked Administrator role carries — it satisfies every key. */
export const ALL_PERMISSIONS = '*'
